// Cloudflare Worker - API 엔드포인트
import { 
    getAllProperties, 
    getPropertyById, 
    getPropertiesByRegion,
    searchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    formatPropertyForFrontend
} from './database.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // CORS 헤더
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // OPTIONS 요청 처리
        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // 매물 목록 조회 (필터 지원)
            if (path === '/api/properties' && method === 'GET') {
                const searchParams = url.searchParams;
                
                // 필터 파라미터 추출
                const filters = {
                    transactionType: searchParams.get('transaction_type'),
                    type: searchParams.get('type'),
                    region: searchParams.get('region'),
                    minPrice: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')) : null,
                    maxPrice: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')) : null,
                    minArea: searchParams.get('min_area') ? parseFloat(searchParams.get('min_area')) : null,
                    maxArea: searchParams.get('max_area') ? parseFloat(searchParams.get('max_area')) : null,
                };

                let properties;
                if (filters.region && Object.keys(filters).length === 1) {
                    // 지역별 조회
                    properties = await getPropertiesByRegion(env, filters.region);
                } else if (Object.keys(filters).some(key => filters[key] !== null)) {
                    // 필터 검색
                    properties = await searchProperties(env, filters);
                } else {
                    // 전체 조회
                    properties = await getAllProperties(env);
                }

                const formatted = properties.map(formatPropertyForFrontend);
                return new Response(JSON.stringify(formatted), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 매물 상세 조회
            if (path.startsWith('/api/properties/') && method === 'GET') {
                const id = parseInt(path.split('/').pop());
                const property = await getPropertyById(env, id);
                
                if (!property) {
                    return new Response(JSON.stringify({ error: '매물을 찾을 수 없습니다.' }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                return new Response(JSON.stringify(formatPropertyForFrontend(property)), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 매물 등록
            if (path === '/api/properties' && method === 'POST') {
                const propertyData = await request.json();
                const result = await createProperty(env, propertyData);
                
                return new Response(JSON.stringify({ 
                    success: true, 
                    id: result.meta.last_row_id 
                }), {
                    status: 201,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 매물 수정
            if (path.startsWith('/api/properties/') && method === 'PUT') {
                const id = parseInt(path.split('/').pop());
                const propertyData = await request.json();
                const result = await updateProperty(env, id, propertyData);
                
                return new Response(JSON.stringify({ 
                    success: true,
                    changes: result.meta.changes
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 매물 삭제
            if (path.startsWith('/api/properties/') && method === 'DELETE') {
                const id = parseInt(path.split('/').pop());
                const result = await deleteProperty(env, id);
                
                return new Response(JSON.stringify({ 
                    success: true,
                    changes: result.meta.changes
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 이미지 업로드 (R2)
            if (path === '/api/upload' && method === 'POST') {
                const formData = await request.formData();
                const file = formData.get('image');
                
                if (!file) {
                    return new Response(JSON.stringify({ error: '파일이 없습니다.' }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                // 파일명 생성 (타임스탬프 + 원본 파일명)
                const timestamp = Date.now();
                const fileName = `properties/${timestamp}-${file.name}`;
                
                // R2에 업로드
                await env.IMAGES.put(fileName, file.stream(), {
                    httpMetadata: {
                        contentType: file.type,
                    },
                });

                // R2 Public URL 생성 (실제 배포 시 R2 Custom Domain 사용 권장)
                const imageUrl = `https://your-r2-domain.com/${fileName}`;
                
                return new Response(JSON.stringify({ url: imageUrl }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 404
            return new Response(JSON.stringify({ error: 'Not Found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error('Error:', error);
            return new Response(JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message 
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};


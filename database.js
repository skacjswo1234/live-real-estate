// Cloudflare D1 데이터베이스 헬퍼 함수들

/**
 * 모든 매물 조회
 */
export async function getAllProperties(env) {
    const result = await env.DB.prepare(
        `SELECT * FROM properties 
         WHERE is_active = 1 
         ORDER BY created_at DESC`
    ).all();
    
    return result.results || [];
}

/**
 * ID로 매물 조회
 */
export async function getPropertyById(env, id) {
    const result = await env.DB.prepare(
        `SELECT * FROM properties 
         WHERE id = ? AND is_active = 1`
    ).bind(id).first();
    
    return result;
}

/**
 * 지역별 매물 조회
 */
export async function getPropertiesByRegion(env, region) {
    const result = await env.DB.prepare(
        `SELECT * FROM properties 
         WHERE region = ? AND is_active = 1 
         ORDER BY created_at DESC`
    ).bind(region).all();
    
    return result.results || [];
}

/**
 * 필터 조건으로 매물 검색
 */
export async function searchProperties(env, filters) {
    let query = `SELECT * FROM properties WHERE is_active = 1`;
    const conditions = [];
    const bindings = [];
    
    // 거래형태 필터
    if (filters.transactionType) {
        conditions.push(`transaction_type = ?`);
        bindings.push(filters.transactionType);
    }
    
    // 매물 타입 필터
    if (filters.type) {
        conditions.push(`type = ?`);
        bindings.push(filters.type);
    }
    
    // 지역 필터
    if (filters.region) {
        conditions.push(`region = ?`);
        bindings.push(filters.region);
    }
    
    // 가격 범위 필터
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
        conditions.push(`price_value >= ?`);
        bindings.push(filters.minPrice);
    }
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        conditions.push(`price_value <= ?`);
        bindings.push(filters.maxPrice);
    }
    
    // 면적 범위 필터
    if (filters.minArea !== null && filters.minArea !== undefined) {
        conditions.push(`area_value >= ?`);
        bindings.push(filters.minArea);
    }
    if (filters.maxArea !== null && filters.maxArea !== undefined) {
        conditions.push(`area_value <= ?`);
        bindings.push(filters.maxArea);
    }
    
    if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const stmt = env.DB.prepare(query);
    if (bindings.length > 0) {
        const result = await stmt.bind(...bindings).all();
        return result.results || [];
    } else {
        const result = await stmt.all();
        return result.results || [];
    }
}

/**
 * 매물 등록
 */
export async function createProperty(env, propertyData) {
    const {
        name, region, address, transaction_type, price, price_value,
        lease_condition, exclusive_area, supply_area, area, area_value,
        lat, lng, key_money, maintenance_fee, parking, elevator,
        room_count, bathroom_count, purpose, total_floors, floor_number,
        building_direction, approval_date, move_in_date, type, images
    } = propertyData;
    
    // images를 JSON 문자열로 변환
    const imagesJson = images ? JSON.stringify(images) : null;
    
    const result = await env.DB.prepare(
        `INSERT INTO properties (
            name, region, address, transaction_type, price, price_value,
            lease_condition, exclusive_area, supply_area, area, area_value,
            lat, lng, key_money, maintenance_fee, parking, elevator,
            room_count, bathroom_count, purpose, total_floors, floor_number,
            building_direction, approval_date, move_in_date, type, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
        name, region, address, transaction_type, price, price_value,
        lease_condition, exclusive_area, supply_area, area, area_value,
        lat, lng, key_money, maintenance_fee, parking, elevator,
        room_count, bathroom_count, purpose, total_floors, floor_number,
        building_direction, approval_date, move_in_date, type || '상가', imagesJson
    ).run();
    
    return result;
}

/**
 * 매물 수정
 */
export async function updateProperty(env, id, propertyData) {
    const {
        name, region, address, transaction_type, price, price_value,
        lease_condition, exclusive_area, supply_area, area, area_value,
        lat, lng, key_money, maintenance_fee, parking, elevator,
        room_count, bathroom_count, purpose, total_floors, floor_number,
        building_direction, approval_date, move_in_date, type, images
    } = propertyData;
    
    // images를 JSON 문자열로 변환
    const imagesJson = images ? JSON.stringify(images) : null;
    
    const result = await env.DB.prepare(
        `UPDATE properties SET
            name = ?, region = ?, address = ?, transaction_type = ?, price = ?, price_value = ?,
            lease_condition = ?, exclusive_area = ?, supply_area = ?, area = ?, area_value = ?,
            lat = ?, lng = ?, key_money = ?, maintenance_fee = ?, parking = ?, elevator = ?,
            room_count = ?, bathroom_count = ?, purpose = ?, total_floors = ?, floor_number = ?,
            building_direction = ?, approval_date = ?, move_in_date = ?, type = ?, images = ?,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
    ).bind(
        name, region, address, transaction_type, price, price_value,
        lease_condition, exclusive_area, supply_area, area, area_value,
        lat, lng, key_money, maintenance_fee, parking, elevator,
        room_count, bathroom_count, purpose, total_floors, floor_number,
        building_direction, approval_date, move_in_date, type || '상가', imagesJson, id
    ).run();
    
    return result;
}

/**
 * 매물 삭제 (소프트 삭제)
 */
export async function deleteProperty(env, id) {
    const result = await env.DB.prepare(
        `UPDATE properties 
         SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`
    ).bind(id).run();
    
    return result;
}

/**
 * 매물 데이터를 프론트엔드 형식으로 변환
 */
export function formatPropertyForFrontend(property) {
    // images JSON 문자열을 배열로 변환
    let images = [];
    if (property.images) {
        try {
            images = JSON.parse(property.images);
        } catch (e) {
            images = [];
        }
    }
    
    return {
        id: property.id,
        name: property.name,
        region: property.region,
        address: property.address,
        transactionType: property.transaction_type,
        price: property.price,
        priceValue: property.price_value,
        leaseCondition: property.lease_condition,
        exclusiveArea: property.exclusive_area,
        supplyArea: property.supply_area,
        area: property.area,
        areaValue: property.area_value,
        lat: property.lat,
        lng: property.lng,
        keyMoney: property.key_money,
        maintenanceFee: property.maintenance_fee,
        parking: property.parking,
        elevator: property.elevator,
        roomCount: property.room_count,
        bathroomCount: property.bathroom_count,
        purpose: property.purpose,
        totalFloors: property.total_floors,
        floorNumber: property.floor_number,
        buildingDirection: property.building_direction,
        approvalDate: property.approval_date,
        moveInDate: property.move_in_date,
        type: property.type,
        images: images,
        createdAt: property.created_at,
        updatedAt: property.updated_at
    };
}


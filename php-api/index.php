<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'SupabaseClient.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/api/', '', $uri);
$segments = explode('/', trim($uri, '/'));
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

$client = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

try {
    $resource = $segments[0] ?? '';
    $id = $segments[1] ?? null;

    switch ($resource) {
        case 'meals':
            handleMeals($client, $method, $id, $body, $token);
            break;
        case 'weekly-menus':
            handleWeeklyMenus($client, $method, $id, $body, $token);
            break;
        case 'meal-times':
            handleMealTimes($client, $method, $id, $body, $token);
            break;
        case 'custom-meal-types':
            handleCustomMealTypes($client, $method, $id, $body, $token);
            break;
        case 'menu-config':
            handleMenuConfig($client, $method, $id, $body, $token);
            break;
        case 'friends':
            handleFriends($client, $method, $id, $body, $token);
            break;
        case 'friend-requests':
            handleFriendRequests($client, $method, $id, $body, $token);
            break;
        case 'shared-menus':
            handleSharedMenus($client, $method, $id, $body, $token);
            break;
        case 'profiles':
            handleProfiles($client, $method, $id, $body, $token);
            break;
        default:
            jsonResponse(404, ['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    jsonResponse(500, ['error' => $e->getMessage()]);
}

function handleMeals($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('meals')->select('*')->eq('user_id', $userId)->order('name')->execute();
            return jsonResponse(200, $data);
        case 'POST':
            $body['user_id'] = $userId;
            $data = $client->from('meals')->insert($body)->execute();
            return jsonResponse(201, $data);
        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $data = $client->from('meals')->update($body)->eq('id', $id)->execute();
            return jsonResponse(200, $data);
        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $client->from('meals')->delete()->eq('id', $id)->execute();
            return jsonResponse(204, null);
    }
}

function handleWeeklyMenus($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('weekly_menus')->select('*')->eq('user_id', $userId)->order('created_at', 'desc')->limit(1)->execute();
            return jsonResponse(200, $data[0] ?? null);
        case 'POST':
            $body['user_id'] = $userId;
            $data = $client->from('weekly_menus')->insert($body)->execute();
            return jsonResponse(201, $data);
        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $data = $client->from('weekly_menus')->update($body)->eq('id', $id)->execute();
            return jsonResponse(200, $data);
    }
}

function handleMealTimes($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('meal_times')->select('*')->eq('user_id', $userId)->order('order_index')->execute();
            return jsonResponse(200, $data);
        case 'POST':
            $body['user_id'] = $userId;
            $data = $client->from('meal_times')->insert($body)->execute();
            return jsonResponse(201, $data);
        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $data = $client->from('meal_times')->update($body)->eq('id', $id)->execute();
            return jsonResponse(200, $data);
        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $client->from('meal_times')->delete()->eq('id', $id)->execute();
            return jsonResponse(204, null);
    }
}

function handleCustomMealTypes($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('custom_meal_types')->select('*')->eq('user_id', $userId)->order('name')->execute();
            return jsonResponse(200, $data);
        case 'POST':
            $body['user_id'] = $userId;
            $data = $client->from('custom_meal_types')->insert($body)->execute();
            return jsonResponse(201, $data);
        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $data = $client->from('custom_meal_types')->update($body)->eq('id', $id)->execute();
            return jsonResponse(200, $data);
        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $client->from('custom_meal_types')->delete()->eq('id', $id)->execute();
            return jsonResponse(204, null);
    }
}

function handleMenuConfig($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('menu_config')->select('*')->eq('user_id', $userId)->limit(1)->execute();
            return jsonResponse(200, $data[0] ?? null);
        case 'POST':
            $body['user_id'] = $userId;
            $data = $client->from('menu_config')->upsert($body)->execute();
            return jsonResponse(200, $data);
        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $data = $client->from('menu_config')->update($body)->eq('id', $id)->execute();
            return jsonResponse(200, $data);
    }
}

function handleFriends($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('friend_requests')
                ->select('*, sender:profiles!friend_requests_sender_id_fkey(*), receiver:profiles!friend_requests_receiver_id_fkey(*)')
                ->eq('status', 'accepted')
                ->or("sender_id.eq.{$userId},receiver_id.eq.{$userId}")
                ->execute();
            
            $friends = array_map(function($r) use ($userId) {
                if ($r['sender_id'] === $userId) {
                    return $r['receiver'];
                }
                return $r['sender'];
            }, $data);
            return jsonResponse(200, $friends);
        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'Friend ID required']);
            $client->from('friend_requests')
                ->delete()
                ->eq('status', 'accepted')
                ->or("and(sender_id.eq.{$userId},receiver_id.eq.{$id}),and(sender_id.eq.{$id},receiver_id.eq.{$userId})")
                ->execute();
            return jsonResponse(204, null);
    }
}

function handleFriendRequests($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('friend_requests')
                ->select('*, sender:profiles!friend_requests_sender_id_fkey(*), receiver:profiles!friend_requests_receiver_id_fkey(*)')
                ->or("sender_id.eq.{$userId},receiver_id.eq.{$userId}")
                ->order('created_at', 'desc')
                ->execute();
            return jsonResponse(200, $data);
        case 'POST':
            $receiverEmail = $body['receiver_email'] ?? null;
            if (!$receiverEmail) return jsonResponse(400, ['error' => 'Email required']);
            
            $users = $client->from('profiles')->select('id')->eq('email', $receiverEmail)->execute();
            if (empty($users)) return jsonResponse(404, ['error' => 'User not found']);
            
            $data = $client->from('friend_requests')->insert([
                'sender_id' => $userId,
                'receiver_id' => $users[0]['id'],
                'status' => 'pending'
            ])->execute();
            return jsonResponse(201, $data);
        case 'PUT':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $data = $client->from('friend_requests')->update(['status' => $body['status']])->eq('id', $id)->execute();
            return jsonResponse(200, $data);
    }
}

function handleSharedMenus($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('shared_menus')
                ->select('*, owner:profiles!shared_menus_owner_id_fkey(*)')
                ->eq('shared_with_id', $userId)
                ->order('shared_at', 'desc')
                ->execute();
            return jsonResponse(200, $data);
        case 'POST':
            $body['owner_id'] = $userId;
            $data = $client->from('shared_menus')->insert($body)->execute();
            return jsonResponse(201, $data);
        case 'DELETE':
            if (!$id) return jsonResponse(400, ['error' => 'ID required']);
            $client->from('shared_menus')->delete()->eq('id', $id)->execute();
            return jsonResponse(204, null);
    }
}

function handleProfiles($client, $method, $id, $body, $token) {
    $userId = $client->getUserIdFromToken($token);
    if (!$userId) return jsonResponse(401, ['error' => 'Unauthorized']);

    switch ($method) {
        case 'GET':
            $data = $client->from('profiles')->select('*')->eq('id', $userId)->limit(1)->execute();
            return jsonResponse(200, $data[0] ?? null);
        case 'PUT':
            $data = $client->from('profiles')->update($body)->eq('id', $userId)->execute();
            return jsonResponse(200, $data);
    }
}

function jsonResponse($status, $data) {
    http_response_code($status);
    if ($data !== null) {
        echo json_encode($data);
    }
}

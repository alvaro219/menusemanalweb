<?php

class SupabaseClient {
    private $url;
    private $key;
    private $table;
    private $query = [];
    private $method = 'GET';
    private $body = null;
    private $selectColumns = '*';
    private $orders = [];
    private $filters = [];
    private $limitValue = null;
    private $isInsert = false;
    private $isUpdate = false;
    private $isDelete = false;
    private $isUpsert = false;

    public function __construct($url, $key) {
        $this->url = rtrim($url, '/');
        $this->key = $key;
    }

    public function from($table) {
        $clone = clone $this;
        $clone->table = $table;
        $clone->filters = [];
        $clone->orders = [];
        $clone->limitValue = null;
        $clone->selectColumns = '*';
        $clone->isInsert = false;
        $clone->isUpdate = false;
        $clone->isDelete = false;
        $clone->isUpsert = false;
        $clone->body = null;
        return $clone;
    }

    public function select($columns = '*') {
        $this->selectColumns = $columns;
        $this->method = 'GET';
        return $this;
    }

    public function insert($data) {
        $this->body = $data;
        $this->method = 'POST';
        $this->isInsert = true;
        return $this;
    }

    public function update($data) {
        $this->body = $data;
        $this->method = 'PATCH';
        $this->isUpdate = true;
        return $this;
    }

    public function upsert($data) {
        $this->body = $data;
        $this->method = 'POST';
        $this->isUpsert = true;
        return $this;
    }

    public function delete() {
        $this->method = 'DELETE';
        $this->isDelete = true;
        return $this;
    }

    public function eq($column, $value) {
        $this->filters[] = "{$column}=eq.{$value}";
        return $this;
    }

    public function or($condition) {
        $this->filters[] = "or=({$condition})";
        return $this;
    }

    public function order($column, $direction = 'asc') {
        $this->orders[] = "{$column}.{$direction}";
        return $this;
    }

    public function limit($n) {
        $this->limitValue = $n;
        return $this;
    }

    public function execute() {
        $endpoint = "{$this->url}/rest/v1/{$this->table}";
        
        $queryParams = [];
        if ($this->method === 'GET' && $this->selectColumns) {
            $queryParams[] = "select={$this->selectColumns}";
        }
        foreach ($this->filters as $filter) {
            $queryParams[] = $filter;
        }
        if (!empty($this->orders)) {
            $queryParams[] = "order=" . implode(',', $this->orders);
        }
        if ($this->limitValue !== null) {
            $queryParams[] = "limit={$this->limitValue}";
        }

        if (!empty($queryParams)) {
            $endpoint .= '?' . implode('&', $queryParams);
        }

        $headers = [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}",
            "Content-Type: application/json",
            "Prefer: return=representation"
        ];

        if ($this->isUpsert) {
            $headers[] = "Prefer: resolution=merge-duplicates,return=representation";
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $this->method);

        if ($this->body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($this->body));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("Supabase API error ({$httpCode}): {$response}");
        }

        return json_decode($response, true) ?? [];
    }

    public function getUserIdFromToken($token) {
        if (empty($token)) return null;
        
        $endpoint = "{$this->url}/auth/v1/user";
        $headers = [
            "apikey: {$this->key}",
            "Authorization: Bearer {$token}",
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) return null;
        
        $user = json_decode($response, true);
        return $user['id'] ?? null;
    }
}

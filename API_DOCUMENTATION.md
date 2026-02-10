# Dokumentasi API & API Key

Sistem ini menyediakan API untuk mengakses data BTS dan melakukan pencarian MSISDN secara real-time.

## 1. Manajemen API Key

Untuk mengakses endpoint yang dilindungi, Anda memerlukan API Key yang valid.

### Mendapatkan API Key
1. Buka Dashboard Admin.
2. Navigasi ke menu **API Keys**.
3. Klik **Generate Key**.
4. Simpan kunci Anda dengan aman. Kunci ini harus disertakan dalam header setiap permintaan API.

### Menggunakan API Key
Sertakan API Key dalam header HTTP `x-api-key` pada setiap request.

**Contoh Header:**
```http
x-api-key: sk_live_xxxxxxxxxxxx
```

---

## 2. Endpoint API

### MSISDN Lookup
Mendapatkan informasi detail mengenai nomor telepon (MSISDN), termasuk lokasi BTS terakhir yang terdeteksi.

*   **URL:** `/api/msisdn/lookup`
*   **Method:** `GET`
*   **Query Params:**
    *   `msisdn` (required): Nomor telepon dengan format internasional (contoh: `628120000001`)
*   **Authentication:** Diperlukan API Key di header atau session login admin.

**Contoh Request (cURL):**
```bash
curl -X GET "https://[your-app-url].replit.app/api/msisdn/lookup?msisdn=628120000001" \
     -H "x-api-key: YOUR_API_KEY"
```

**Contoh Response:**
```json
{
  "msisdn": "628120000001",
  "provider": "Telkomsel",
  "status": "active",
  "registered_name": "Budi Santoso",
  "location": {
    "lat": -6.1754,
    "long": 106.8272,
    "address": "Gambir, Central Jakarta City, Jakarta",
    "towerInfo": {
      "cellId": "CID-12345",
      "lac": "LAC-777",
      "operator": "Telkomsel"
    }
  },
  "region": {
    "village": "Gambir",
    "district": "Gambir",
    "regency": "Jakarta Pusat",
    "province": "DKI Jakarta"
  }
}
```

### Daftar BTS (Admin Only)
Mendapatkan daftar menara BTS yang terdaftar di database.

*   **URL:** `/api/bts`
*   **Method:** `GET`
*   **Authentication:** Diperlukan session login admin.

---

## 3. Limitasi & Keamanan
- Setiap API Key memiliki limit penggunaan yang ditentukan saat pembuatan.
- Jika API Key bocor, segera lakukan **Revoke** melalui dashboard admin.
- API ini tidak menggunakan simulasi; semua data ditarik langsung dari database produksi.

# AmsholPay Documentation

Layanan Amalsholeh.com untuk memudahkan pengguna dalam bertransaksi online.

Dokumentasi yang bisa digunakan ada 2 type, **production** dan **development**.

### Prefix URL

Production: ****`https://payment.amalsholeh.com/api/v1/`

Development: ****`https://payment.amalsholeh.com/api/dev/`

Untuk development gunakan **api_key** dan **private_key** berikut:

```php
API_KEY = testing
PRIVATE_KEY = testing
merchand_code = TEST
```

---

### List Bank Virtual Account dan Code

1. Mandiri VA : `mandiriva`
2. BNI VA : `bniva`
3. CIMB VA : `cimbva`
4. Permata VA : `permataiva`
5. Danamon VA : `danamonva`
6. BJB VA : `bjbva`
7. BRI VA : `briva`

### List Pembayaran Instan dan Code

1. GoPay : `gopay`
2. QRIS : `qris`

---

### 1. Generate Signature

Untuk generate signature, menggunakan **hash_hmac** dengan susunan sebagai berikut:

```php
hash_hmac('sha256', 'MERCHANT_CODE' + 'PAYMENT_CODE' + 'INVOICE_CODE' + 'AMOUNT', 'PRIVATE_KEY')
```

### 2. Generate Payment

Endpoint: `/generate`

Method: `POST`

**Header:**

```php
'Authorization' = 'Bearer API_KEY'
```

**Body:**

```php
$data = [
	'merchant_code' => 'ABCDE', // required, ask for get this
	'customer_name' => 'Dadang', // required
	'customer_phone' => '628987654321', // required
	'customer_email' => 'customer@email.com', // required
	'trx_id' => 'INVOICE-0001', // required
	'payment_method' => 'mandiriva', // required, CODE
	'amount' => 99000, // required, nominal pembayaran
	'description' => 'lorem ipsum' // optional, Keterangan
];
```

**Response:**

```php
{
	"status": true,
	"data": {
		"reference": "AMALSHOL0000000000000000", // code from bank
		"merchant_ref": "INVOICE-0001",
		"payment_method": "mandiriva",
		"payment_name": "Mandiri Virtual Account",
		"customer_name": "Dadang",
		"customer_email": "customer@email.com",
		"customer_phone": "628987654321",
		"callback_url": "yourdomain.com/callback",
		"amount": 99000,
		"fee_merchant": 3500,
		"amount_received": 95500,
		"pay_code": "7001400001234567", // Number Virtual Account/URL QRIS
		"status": "pending",
		"paid_at": null,
		"qr_string": null,
		"pay_url": null,
		"instructions": [] // Instruction for payment
	}
}
```

### 3. Callback

Callback transaksi yang dilakukan oleh pengguna, akan dikirim ke URL yang didaftarkan. Data yang dikirim, bisa dilihat di bawah:

Method: `POST`

**Body**

```php
"reference"         = "AMALSHOL0000000000000000", // code from bank
"merchant_ref"      = "INVOICE-0001",
"payment_method"    = "mandiriva",
"payment_name"      = "Mandiri Virtual Account",
"customer_name"     = "Dadang",
"customer_email"    = "customer@email.com",
"customer_phone"    = "62987654321",
"callback_url"      = "",
"amount"            = 99000,
"fee_merchant"      = 3500,
"amount_received"   = 95500,
"pay_code"          = "7001400001234567",
"status"            = "success", // success, expired, cancel, pending
"paid_at"           = "2022-12-31 22:30:30",
"signature"         = "shdjshdjfhsjkdfhjsdhfjdhsjfhdkg", // code hash_hmac
```

### 4. Check Status Transaction

Untuk mengecek status transaksi, bisa menggunakan endpoint ini.

Endpoint: `/check`

Method: `POST`

**Header:**

```php
'Authorization' = 'Bearer API_KEY'
```

**Body:**

```php
$data = [
	'reference' => 'ABCDE', // required, you got this token from created transaction
];
```

**Response:**

```php
{
	"status": true,
	"data": {
		"reference": "AMALSHOL0000000000000000", // code from bank
		"merchant_ref": "INVOICE-0001",
		"payment_method": "mandiriva",
		"payment_name": "Mandiri Virtual Account",
		"customer_name": "Dadang",
		"customer_email": "customer@email.com",
		"customer_phone": "628987654321",
		"callback_url": "yourdomain.com/callback",
		"amount": 99000,
		"fee_merchant": 3500,
		"amount_received": 95500,
		"pay_code": "7001400001234567", // Number Virtual Account/URL QRIS
		"status": "pending",
		"paid_at": null,
		"qr_string": null,
		"pay_url": null,
		"instructions": [] // Instruction for payment
	}
}
```

### 5. Testing Callback

Untuk mencoba pada fase development, bisa menggunakan tools testing dengan link di bawah ini:

[**https://payment.amalsholeh.com/sandbox](https://payment.amalsholeh.com/sandbox)** 

<aside>
💡 Jika ada yang ingin ditanyakan, bisa menghubungi tim terkait.

</aside>

Salam,
**Amalsholeh.com Dev Team**
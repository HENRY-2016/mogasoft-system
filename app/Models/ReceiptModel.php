<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptModel extends Model
{
    use HasFactory;

    protected $table = 'receipts';

    protected $fillable = [
        'customer_id',
        'invoice_id',
        'receipt_number',
        'date',
        'amount_paid',
        'balance',
        'payment_method',
        'transaction_id',
        'bank_name',
        'check_number',
        'mobile_number',
        'notes',
        'received_by',
        'status'
    ];

    protected $casts = [
        'date' => 'string',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    /**
     * Get the items for the receipt.
     */
    public function items()
    {
        return $this->hasMany(ReceiptItem::class, 'receipt_id');
    }

    /**
     * Get the invoice that owns the receipt.
     */
    public function invoice()
    {
        return $this->belongsTo(InvoiceModel::class, 'invoice_id');
    }

    /**
     * Get the customer that owns the receipt.
     */
    public function customer()
    {
        return $this->belongsTo(CustomerModel::class, 'customer_id');
    }

    /**
     * Generate receipt number
     */
    public static function generateReceiptNumber()
    {
        $prefix = 'RCP-' . date('Ymd') . '-';
        $lastReceipt = self::where('receipt_number', 'like', $prefix . '%')
            ->orderBy('receipt_number', 'desc')
            ->first();

        if ($lastReceipt) {
            $lastNumber = intval(substr($lastReceipt->receipt_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
}

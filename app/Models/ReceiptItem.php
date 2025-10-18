<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptItem extends Model
{
    use HasFactory;

    protected $table = 'receipt_items';

    protected $fillable = [
        'receipt_id',
        'description',
        'amount'
    ];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    /**
     * Get the receipt that owns the receipt item.
     */
    public function receipt()
    {
        return $this->belongsTo(ReceiptModel::class, 'receipt_id');
    }
}

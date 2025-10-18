<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerModel extends Model
{
    use HasFactory;
    protected $table = 'customers';
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'company_name',
        'tax_number'
    ];

    public function invoices()
    {
        return $this->hasMany(InvoiceModel::class, 'customer_id');
    }
}

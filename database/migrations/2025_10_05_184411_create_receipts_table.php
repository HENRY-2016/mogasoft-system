<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->string('receipt_number')->unique();
            $table->string('date');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->decimal('balance', 10, 2)->default(0);
            $table->enum('payment_method', ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'check', 'other']);
            $table->string('transaction_id')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('check_number')->nullable();
            $table->string('mobile_number')->nullable();
            $table->text('notes')->nullable();
            $table->string('received_by')->nullable();
            $table->enum('status', ['completed', 'partial'])->default('completed');
            $table->timestamps();

            $table->index('customer_id');
            $table->index('invoice_id');
            $table->index('receipt_number');
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};

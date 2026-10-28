<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        "user_id",
        "action",
        "auditable_type",
        "auditable_id",
        "metadata",
        "created_at",
    ];

    protected function casts(): array
    {
        return [
            "metadata" => "array",
            "created_at" => "datetime",
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(?int $userId, string $action, ?Model $subject = null, array $metadata = []): self
    {
        return self::create([
            "user_id" => $userId,
            "action" => $action,
            "auditable_type" => $subject ? get_class($subject) : "system",
            "auditable_id" => $subject?->getKey(),
            "metadata" => $metadata,
            "created_at" => now(),
        ]);
    }
}

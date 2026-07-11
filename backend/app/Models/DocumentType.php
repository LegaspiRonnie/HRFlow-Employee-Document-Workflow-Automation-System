<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['name', 'code', 'description'])]
class DocumentType extends Model
{
    public function template(): HasOne
    {
        return $this->hasOne(DocumentTemplate::class);
    }
}

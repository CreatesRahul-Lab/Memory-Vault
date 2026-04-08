package com.memoryos.app.data.model

import com.google.gson.annotations.SerializedName

data class ApiKey(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val key: String = "",
    val fullKey: String? = null,
    val active: Boolean = true,
    val lastUsed: String? = null,
    val createdAt: String? = null
)

data class CreateApiKeyRequest(
    val name: String
)

data class ToggleApiKeyResponse(
    @SerializedName("_id") val id: String,
    val active: Boolean
)

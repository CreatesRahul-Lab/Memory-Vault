package com.memoryos.app.data.model

import com.google.gson.annotations.SerializedName

data class Webhook(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val url: String = "",
    val events: List<String> = emptyList(),
    val secret: String? = null,
    val active: Boolean = true,
    val lastTriggered: String? = null,
    val failCount: Int = 0,
    val createdAt: String? = null
)

data class CreateWebhookRequest(
    val name: String,
    val url: String,
    val events: List<String>
)

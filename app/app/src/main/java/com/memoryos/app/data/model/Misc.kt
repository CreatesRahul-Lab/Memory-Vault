package com.memoryos.app.data.model

data class MessageResponse(
    val message: String
)

data class AiSummarizeRequest(
    val itemId: String
)

data class AiSummarizeResponse(
    val summary: String,
    val keyPoints: List<String>,
    val aiTags: List<String>
)

data class AiAskRequest(
    val question: String
)

data class AiAskResponse(
    val answer: String? = null,
    val sources: List<Item>? = null
)

data class DigestResponse(
    val period: String,
    val since: String,
    val stats: DigestStats,
    val topTags: List<TagCount>,
    val recentItems: List<Item>,
    val resurfaced: List<Item>
)

data class DigestStats(
    val totalSaved: Int = 0,
    val favoritedCount: Int = 0,
    val reviewDue: Int = 0,
    val tasksPending: Int = 0
)

data class ImportRequest(
    val items: List<CreateItemRequest>,
    val collections: List<CreateCollectionRequest>? = null
)

data class ImportResponse(
    val message: String,
    val imported: Int,
    val skipped: Int,
    val collectionsCreated: Int
)

data class ItemVersion(
    @com.google.gson.annotations.SerializedName("_id") val id: String = "",
    val item: String = "",
    val user: String = "",
    val snapshot: Map<String, Any?> = emptyMap(),
    val changeNote: String? = null,
    val version: Int = 0,
    val createdAt: String? = null
)

data class RestoreVersionRequest(
    val versionId: String
)

data class RestoreVersionResponse(
    val message: String,
    val item: Item
)

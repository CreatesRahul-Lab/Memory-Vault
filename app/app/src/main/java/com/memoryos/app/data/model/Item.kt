package com.memoryos.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "items")
data class Item(
    @PrimaryKey
    @SerializedName("_id") val id: String = "",
    val user: String? = null,
    val url: String = "",
    val title: String = "Untitled",
    val description: String? = null,
    val domain: String? = null,
    val favicon: String? = null,
    val type: String = "page",
    val notes: String? = null,
    val content: String? = null,
    val summary: String? = null,
    val collection: String? = null,
    val duplicateOf: String? = null,
    val reviewCount: Int = 0,
    val nextReviewDate: String? = null,
    val easeFactor: Double = 2.5,
    val interval: Int = 0,
    val isTask: Boolean = false,
    val taskDone: Boolean = false,
    val favorite: Boolean = false,
    val createdAt: String? = null,
    val updatedAt: String? = null
) {
    // Room can't store lists directly, so these are handled via TypeConverters
    @androidx.room.Ignore
    val tags: List<String> = emptyList()
    @androidx.room.Ignore
    val aiTags: List<String> = emptyList()
    @androidx.room.Ignore
    val keyPoints: List<String> = emptyList()
    @androidx.room.Ignore
    val highlights: List<Highlight> = emptyList()
}

data class Highlight(
    val text: String = "",
    val color: String = "#e8b931",
    val note: String? = null
)

data class ItemsResponse(
    val items: List<Item>,
    val total: Int,
    val page: Int,
    val pages: Int
)

data class ItemStats(
    val total: Int = 0,
    val favorites: Int = 0,
    val types: Map<String, Int> = emptyMap()
)

data class TagCount(
    val tag: String,
    val count: Int
)

data class CreateItemRequest(
    val url: String,
    val title: String? = null,
    val description: String? = null,
    val domain: String? = null,
    val favicon: String? = null,
    val type: String = "page",
    val tags: List<String>? = null,
    val notes: String? = null,
    val content: String? = null,
    val highlights: List<Highlight>? = null,
    val collection: String? = null,
    val isTask: Boolean = false
)

data class DuplicateWarningItem(
    @SerializedName("_id") val id: String,
    val url: String,
    val title: String,
    val domain: String?
)

data class ItemWithDuplicateWarning(
    @SerializedName("_id") val id: String,
    val url: String,
    val title: String,
    val duplicateWarning: List<DuplicateWarningItem>? = null
)

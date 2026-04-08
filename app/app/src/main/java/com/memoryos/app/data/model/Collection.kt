package com.memoryos.app.data.model

import com.google.gson.annotations.SerializedName

data class Collection(
    @SerializedName("_id") val id: String = "",
    val user: String? = null,
    val name: String = "",
    val description: String? = null,
    val color: String = "#e8b931",
    val icon: String = "folder",
    val isPublic: Boolean = false,
    val shareToken: String? = null,
    val collaborators: List<Collaborator> = emptyList(),
    val savedFilter: SavedFilter? = null,
    val itemCount: Int = 0,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class Collaborator(
    val user: String = "",
    val role: String = "viewer"
)

data class SavedFilter(
    val search: String? = null,
    val tags: List<String>? = null,
    val types: List<String>? = null,
    val favorite: Boolean? = null
)

data class CreateCollectionRequest(
    val name: String,
    val description: String? = null,
    val color: String = "#e8b931",
    val icon: String = "folder",
    val savedFilter: SavedFilter? = null
)

data class CollectionDetailResponse(
    val collection: com.memoryos.app.data.model.Collection,
    val items: List<Item>,
    val total: Int,
    val page: Int,
    val pages: Int
)

data class ShareResponse(
    val isPublic: Boolean? = null,
    val shareToken: String? = null,
    val shareUrl: String? = null,
    val collaborators: List<Collaborator>? = null
)

data class CollectionItemsRequest(
    val itemIds: List<String>,
    val action: String // "add" or "remove"
)

data class ShareRequest(
    val isPublic: Boolean? = null,
    val collaboratorEmail: String? = null,
    val role: String? = null
)

data class SharedCollectionResponse(
    val collection: SharedCollectionInfo,
    val items: List<Item>,
    val total: Int,
    val page: Int,
    val pages: Int
)

data class SharedCollectionInfo(
    val name: String,
    val description: String?,
    val color: String,
    val icon: String,
    val owner: String
)

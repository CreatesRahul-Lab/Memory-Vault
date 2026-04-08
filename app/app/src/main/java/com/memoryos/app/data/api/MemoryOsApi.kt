package com.memoryos.app.data.api

import com.memoryos.app.data.model.*
import com.memoryos.app.data.model.Collection as MemoryCollection
import retrofit2.Response
import retrofit2.http.*

interface MemoryOsApi {
    // Auth endpoints
    @POST("auth/register")
    suspend fun register(@Body request: AuthRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<UserResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<MessageResponse>

    // Items endpoints
    @GET("items")
    suspend fun getItems(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("tags") tags: String? = null,
        @Query("type") type: String? = null,
        @Query("favorite") favorite: Boolean? = null,
        @Query("isTask") isTask: Boolean? = null,
        @Query("collection") collection: String? = null
    ): Response<ItemsResponse>

    @GET("items/{id}")
    suspend fun getItem(@Path("id") itemId: String): Response<Item>

    @POST("items")
    suspend fun createItem(@Body request: CreateItemRequest): Response<Item>

    @PUT("items/{id}")
    suspend fun updateItem(@Path("id") itemId: String, @Body request: CreateItemRequest): Response<Item>

    @DELETE("items/{id}")
    suspend fun deleteItem(@Path("id") itemId: String): Response<MessageResponse>

    @GET("items/stats")
    suspend fun getItemStats(): Response<ItemStats>

    @GET("items/tags")
    suspend fun getTags(): Response<List<TagCount>>

    @GET("items/duplicates")
    suspend fun getDuplicates(): Response<List<DuplicateWarningItem>>

    @GET("items/related")
    suspend fun getRelatedItems(@Query("itemId") itemId: String): Response<List<Item>>

    @POST("items/import")
    suspend fun importItems(@Body request: ImportRequest): Response<ImportResponse>

    @GET("items/export")
    suspend fun exportItems(): Response<List<Item>>

    // Collections endpoints
    @GET("collections")
    suspend fun getCollections(): Response<List<MemoryCollection>>

    @GET("collections/{id}")
    suspend fun getCollection(@Path("id") collectionId: String): Response<MemoryCollection>

    @GET("collections/{id}/items")
    suspend fun getCollectionItems(
        @Path("id") collectionId: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<CollectionDetailResponse>

    @POST("collections")
    suspend fun createCollection(@Body request: CreateCollectionRequest): Response<MemoryCollection>

    @PUT("collections/{id}")
    suspend fun updateCollection(
        @Path("id") collectionId: String,
        @Body request: CreateCollectionRequest
    ): Response<MemoryCollection>

    @DELETE("collections/{id}")
    suspend fun deleteCollection(@Path("id") collectionId: String): Response<MessageResponse>

    @POST("collections/{id}/items")
    suspend fun updateCollectionItems(
        @Path("id") collectionId: String,
        @Body request: CollectionItemsRequest
    ): Response<MessageResponse>

    @POST("collections/{id}/share")
    suspend fun shareCollection(
        @Path("id") collectionId: String,
        @Body request: ShareRequest
    ): Response<ShareResponse>

    @GET("shared/{token}")
    suspend fun getSharedCollection(@Path("token") token: String): Response<SharedCollectionResponse>

    // Review endpoints
    @GET("review")
    suspend fun getReviewItems(): Response<ReviewResponse>

    @POST("review")
    suspend fun submitReview(@Body request: ReviewRequest): Response<ReviewResult>

    // Comments endpoints
    @GET("comments")
    suspend fun getComments(@Query("itemId") itemId: String): Response<List<Comment>>

    @POST("comments")
    suspend fun createComment(@Body request: CreateCommentRequest): Response<Comment>

    @DELETE("comments/{id}")
    suspend fun deleteComment(@Path("id") commentId: String): Response<MessageResponse>

    // Teams endpoints
    @GET("teams")
    suspend fun getTeams(): Response<List<Team>>

    @GET("teams/{id}")
    suspend fun getTeam(@Path("id") teamId: String): Response<TeamDetailResponse>

    @POST("teams")
    suspend fun createTeam(@Body request: CreateTeamRequest): Response<Team>

    @PUT("teams/{id}")
    suspend fun updateTeam(
        @Path("id") teamId: String,
        @Body request: TeamUpdateRequest
    ): Response<Team>

    @DELETE("teams/{id}")
    suspend fun deleteTeam(@Path("id") teamId: String): Response<MessageResponse>

    @POST("teams/{id}/members")
    suspend fun addTeamMember(
        @Path("id") teamId: String,
        @Body request: AddMemberRequest
    ): Response<TeamMember>

    @DELETE("teams/{id}/members")
    suspend fun removeTeamMember(
        @Path("id") teamId: String,
        @Body request: RemoveMemberRequest
    ): Response<MessageResponse>

    @POST("teams/join")
    suspend fun joinTeam(@Body request: JoinTeamRequest): Response<Team>

    // Reminders endpoints
    @GET("reminders")
    suspend fun getReminders(): Response<RemindersResponse>

    @POST("reminders")
    suspend fun createReminder(@Body request: CreateReminderRequest): Response<Reminder>

    @DELETE("reminders/{id}")
    suspend fun deleteReminder(@Path("id") reminderId: String): Response<MessageResponse>

    // API Keys endpoints
    @GET("keys")
    suspend fun getApiKeys(): Response<List<ApiKey>>

    @POST("keys")
    suspend fun createApiKey(@Body request: CreateApiKeyRequest): Response<ApiKey>

    @DELETE("keys/{id}")
    suspend fun deleteApiKey(@Path("id") keyId: String): Response<MessageResponse>

    @PUT("keys/{id}")
    suspend fun toggleApiKey(@Path("id") keyId: String): Response<ToggleApiKeyResponse>

    // Webhooks endpoints
    @GET("webhooks")
    suspend fun getWebhooks(): Response<List<Webhook>>

    @POST("webhooks")
    suspend fun createWebhook(@Body request: CreateWebhookRequest): Response<Webhook>

    @DELETE("webhooks/{id}")
    suspend fun deleteWebhook(@Path("id") webhookId: String): Response<MessageResponse>

    @PUT("webhooks/{id}")
    suspend fun toggleWebhook(@Path("id") webhookId: String): Response<Webhook>

    // AI endpoints
    @POST("ai/summarize")
    suspend fun summarizeItem(@Body request: AiSummarizeRequest): Response<AiSummarizeResponse>

    @POST("ai/ask")
    suspend fun askAi(@Body request: AiAskRequest): Response<AiAskResponse>

    // Feed endpoint
    @GET("feed")
    suspend fun getFeed(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ItemsResponse>

    // Digest endpoint
    @GET("digest")
    suspend fun getDigest(): Response<DigestResponse>

    // Item versions
    @GET("versions/{itemId}")
    suspend fun getItemVersions(@Path("itemId") itemId: String): Response<List<ItemVersion>>

    @POST("versions/restore")
    suspend fun restoreVersion(@Body request: RestoreVersionRequest): Response<RestoreVersionResponse>
}

package com.memoryos.app.data.repository

import com.memoryos.app.data.api.MemoryOsApi
import com.memoryos.app.data.model.*
import com.memoryos.app.data.model.Collection as MemoryCollection
import javax.inject.Inject

class CollectionRepository @Inject constructor(
    private val api: MemoryOsApi
) {
    suspend fun getCollections(): Result<List<MemoryCollection>> {
        return try {
            val response = api.getCollections()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCollection(collectionId: String): Result<MemoryCollection> {
        return try {
            val response = api.getCollection(collectionId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCollectionItems(collectionId: String, page: Int = 1): Result<CollectionDetailResponse> {
        return try {
            val response = api.getCollectionItems(collectionId, page)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createCollection(request: CreateCollectionRequest): Result<MemoryCollection> {
        return try {
            val response = api.createCollection(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCollection(collectionId: String, request: CreateCollectionRequest): Result<MemoryCollection> {
        return try {
            val response = api.updateCollection(collectionId, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteCollection(collectionId: String): Result<Unit> {
        return try {
            val response = api.deleteCollection(collectionId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCollectionItems(collectionId: String, request: CollectionItemsRequest): Result<Unit> {
        return try {
            val response = api.updateCollectionItems(collectionId, request)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun shareCollection(collectionId: String, request: ShareRequest): Result<ShareResponse> {
        return try {
            val response = api.shareCollection(collectionId, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSharedCollection(token: String): Result<SharedCollectionResponse> {
        return try {
            val response = api.getSharedCollection(token)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class ReviewRepository @Inject constructor(
    private val api: MemoryOsApi
) {
    suspend fun getReviewItems(): Result<ReviewResponse> {
        return try {
            val response = api.getReviewItems()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun submitReview(request: ReviewRequest): Result<ReviewResult> {
        return try {
            val response = api.submitReview(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class CommentRepository @Inject constructor(
    private val api: MemoryOsApi
) {
    suspend fun getComments(itemId: String): Result<List<Comment>> {
        return try {
            val response = api.getComments(itemId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createComment(request: CreateCommentRequest): Result<Comment> {
        return try {
            val response = api.createComment(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteComment(commentId: String): Result<Unit> {
        return try {
            val response = api.deleteComment(commentId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

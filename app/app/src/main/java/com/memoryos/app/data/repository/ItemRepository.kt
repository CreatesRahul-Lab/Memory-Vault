package com.memoryos.app.data.repository

import com.memoryos.app.data.api.MemoryOsApi
import com.memoryos.app.data.db.ItemDao
import com.memoryos.app.data.model.*
import javax.inject.Inject

class ItemRepository @Inject constructor(
    private val api: MemoryOsApi,
    private val itemDao: ItemDao
) {
    suspend fun getItems(
        page: Int = 1,
        limit: Int = 20,
        search: String? = null,
        tags: String? = null,
        type: String? = null,
        favorite: Boolean? = null,
        collection: String? = null
    ): Result<ItemsResponse> {
        return try {
            val response = api.getItems(page, limit, search, tags, type, favorite, collection = collection)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                // Cache items locally
                itemDao.insertItems(body.items)
                Result.success(body)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getItem(itemId: String): Result<Item> {
        return try {
            val response = api.getItem(itemId)
            if (response.isSuccessful && response.body() != null) {
                val item = response.body()!!
                itemDao.insertItem(item)
                Result.success(item)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createItem(request: CreateItemRequest): Result<Item> {
        return try {
            val response = api.createItem(request)
            if (response.isSuccessful && response.body() != null) {
                val item = response.body()!!
                itemDao.insertItem(item)
                Result.success(item)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateItem(itemId: String, request: CreateItemRequest): Result<Item> {
        return try {
            val response = api.updateItem(itemId, request)
            if (response.isSuccessful && response.body() != null) {
                val item = response.body()!!
                itemDao.updateItem(item)
                Result.success(item)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteItem(itemId: String): Result<Unit> {
        return try {
            val response = api.deleteItem(itemId)
            if (response.isSuccessful) {
                itemDao.deleteItemById(itemId)
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getItemStats(): Result<ItemStats> {
        return try {
            val response = api.getItemStats()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTags(): Result<List<TagCount>> {
        return try {
            val response = api.getTags()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getRelatedItems(itemId: String): Result<List<Item>> {
        return try {
            val response = api.getRelatedItems(itemId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDuplicates(): Result<List<DuplicateWarningItem>> {
        return try {
            val response = api.getDuplicates()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun importItems(request: ImportRequest): Result<ImportResponse> {
        return try {
            val response = api.importItems(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun exportItems(): Result<List<Item>> {
        return try {
            val response = api.exportItems()
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

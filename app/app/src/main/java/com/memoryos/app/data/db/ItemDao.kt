package com.memoryos.app.data.db

import androidx.room.*
import com.memoryos.app.data.model.Item
import kotlinx.coroutines.flow.Flow

@Dao
interface ItemDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: Item)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItems(items: List<Item>)

    @Update
    suspend fun updateItem(item: Item)

    @Delete
    suspend fun deleteItem(item: Item)

    @Query("DELETE FROM items WHERE id = :itemId")
    suspend fun deleteItemById(itemId: String)

    @Query("SELECT * FROM items WHERE id = :itemId")
    suspend fun getItemById(itemId: String): Item?

    @Query("SELECT * FROM items ORDER BY createdAt DESC LIMIT :limit OFFSET :offset")
    suspend fun getItems(limit: Int = 20, offset: Int = 0): List<Item>

    @Query("SELECT * FROM items WHERE favorite = 1 ORDER BY createdAt DESC")
    fun getFavoriteItemsFlow(): Flow<List<Item>>

    @Query("SELECT * FROM items WHERE isTask = 1 AND taskDone = 0 ORDER BY createdAt DESC")
    fun getPendingTasksFlow(): Flow<List<Item>>

    @Query("SELECT * FROM items WHERE collection = :collectionId ORDER BY createdAt DESC")
    suspend fun getItemsByCollection(collectionId: String): List<Item>

    @Query("SELECT * FROM items WHERE type = :type ORDER BY createdAt DESC")
    suspend fun getItemsByType(type: String): List<Item>

    @Query("SELECT COUNT(*) FROM items")
    suspend fun getTotalItems(): Int

    @Query("SELECT COUNT(*) FROM items WHERE favorite = 1")
    suspend fun getFavoriteCount(): Int

    @Query("DELETE FROM items")
    suspend fun clearAllItems()

    @Query("SELECT * FROM items WHERE createdAt > :date ORDER BY createdAt DESC")
    suspend fun getItemsSince(date: String): List<Item>
}

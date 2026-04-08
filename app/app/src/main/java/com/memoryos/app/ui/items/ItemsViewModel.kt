package com.memoryos.app.ui.items

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.memoryos.app.data.model.Item
import com.memoryos.app.data.repository.ItemRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ItemDetailState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val item: Item? = null
)

@HiltViewModel
class ItemsViewModel @Inject constructor(
    private val itemRepository: ItemRepository
) : ViewModel() {
    private val _itemsState = MutableStateFlow(ItemsState())
    val itemsState: StateFlow<ItemsState> = _itemsState

    private val _itemDetailState = MutableStateFlow(ItemDetailState())
    val itemDetailState: StateFlow<ItemDetailState> = _itemDetailState

    fun loadItems(page: Int = 1) {
        viewModelScope.launch {
            _itemsState.value = ItemsState(isLoading = true)
            val result = itemRepository.getItems(page = page)
            result.onSuccess { response ->
                _itemsState.value = ItemsState(
                    isLoading = false,
                    items = response.items,
                    totalItems = response.total,
                    currentPage = response.page,
                    pages = response.pages
                )
            }.onFailure { e ->
                _itemsState.value = ItemsState(
                    error = e.message ?: "Failed to load items"
                )
            }
        }
    }

    fun searchItems(query: String) {
        viewModelScope.launch {
            _itemsState.value = ItemsState(isLoading = true)
            val result = itemRepository.getItems(search = query)
            result.onSuccess { response ->
                _itemsState.value = ItemsState(
                    isLoading = false,
                    items = response.items,
                    totalItems = response.total
                )
            }.onFailure { e ->
                _itemsState.value = ItemsState(
                    error = e.message ?: "Search failed"
                )
            }
        }
    }

    fun loadItemDetail(itemId: String) {
        viewModelScope.launch {
            _itemDetailState.value = ItemDetailState(isLoading = true)
            val result = itemRepository.getItem(itemId)
            result.onSuccess { item ->
                _itemDetailState.value = ItemDetailState(
                    isLoading = false,
                    item = item
                )
            }.onFailure { e ->
                _itemDetailState.value = ItemDetailState(
                    error = e.message ?: "Failed to load item"
                )
            }
        }
    }

    fun deleteItem(itemId: String) {
        viewModelScope.launch {
            itemRepository.deleteItem(itemId)
            loadItems()
        }
    }

    fun toggleFavorite(itemId: String) {
        // This would need a separate API endpoint to toggle favorite
        // For now, we'll reload items
        loadItems()
    }
}

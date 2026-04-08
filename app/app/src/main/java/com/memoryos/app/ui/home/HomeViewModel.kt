package com.memoryos.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.memoryos.app.data.model.Item
import com.memoryos.app.data.repository.ItemRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val itemRepository: ItemRepository
) : ViewModel() {
    private val _homeState = MutableStateFlow(HomeState())
    val homeState: StateFlow<HomeState> = _homeState

    fun loadDashboard() {
        viewModelScope.launch {
            _homeState.value = HomeState(isLoading = true)

            // Load items
            val itemsResult = itemRepository.getItems(limit = 5)
            itemsResult.onSuccess { response ->
                // Load stats
                val statsResult = itemRepository.getItemStats()
                statsResult.onSuccess { stats ->
                    _homeState.value = HomeState(
                        isLoading = false,
                        recentItems = response.items,
                        totalItems = stats.total,
                        favoriteCount = stats.favorites,
                        pendingReviewCount = 0 // This would come from review endpoint
                    )
                }.onFailure { e ->
                    _homeState.value = HomeState(
                        error = e.message ?: "Failed to load stats"
                    )
                }
            }.onFailure { e ->
                _homeState.value = HomeState(
                    error = e.message ?: "Failed to load items"
                )
            }
        }
    }

    fun refreshDashboard() {
        loadDashboard()
    }
}

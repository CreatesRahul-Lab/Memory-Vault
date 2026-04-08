package com.memoryos.app.ui.collections

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.memoryos.app.data.repository.CollectionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CollectionsViewModel @Inject constructor(
    private val collectionRepository: CollectionRepository
) : ViewModel() {
    private val _collectionsState = MutableStateFlow(CollectionsState())
    val collectionsState: StateFlow<CollectionsState> = _collectionsState

    fun loadCollections() {
        viewModelScope.launch {
            _collectionsState.value = CollectionsState(isLoading = true)
            val result = collectionRepository.getCollections()
            result.onSuccess { collections ->
                _collectionsState.value = CollectionsState(
                    isLoading = false,
                    collections = collections
                )
            }.onFailure { e ->
                _collectionsState.value = CollectionsState(
                    error = e.message ?: "Failed to load collections"
                )
            }
        }
    }
}

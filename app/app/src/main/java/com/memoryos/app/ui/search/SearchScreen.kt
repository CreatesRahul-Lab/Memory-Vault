package com.memoryos.app.ui.search

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.memoryos.app.data.model.Item
import com.memoryos.app.data.repository.ItemRepository
import com.memoryos.app.ui.components.EmptyState
import com.memoryos.app.ui.components.ItemCard
import com.memoryos.app.ui.components.SearchField
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SearchState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val results: List<Item> = emptyList(),
    val query: String = ""
)

@Composable
fun SearchScreen(viewModel: SearchViewModel = hiltViewModel()) {
    val state by viewModel.searchState.collectAsState()
    var query by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            "Search",
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        SearchField(
            value = query,
            onValueChange = { query = it },
            onSearch = { viewModel.search(query) }
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (state.results.isEmpty() && state.query.isNotEmpty()) {
            EmptyState("No results found for '${state.query}'")
        } else if (state.query.isEmpty()) {
            EmptyState("Search for items by title, tags, or URL")
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(state.results) { item ->
                    ItemCard(
                        title = item.title,
                        description = item.description,
                        url = item.url,
                        onClick = { /* TODO */ }
                    )
                }
            }
        }
    }
}

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val itemRepository: ItemRepository
) : ViewModel() {
    private val _searchState = MutableStateFlow(SearchState())
    val searchState: StateFlow<SearchState> = _searchState

    fun search(query: String) {
        viewModelScope.launch {
            _searchState.value = SearchState(isLoading = true)
            val result = itemRepository.getItems(search = query)
            result.onSuccess { response ->
                _searchState.value = SearchState(
                    isLoading = false,
                    results = response.items,
                    query = query
                )
            }.onFailure { e ->
                _searchState.value = SearchState(
                    error = e.message ?: "Search failed",
                    query = query
                )
            }
        }
    }
}

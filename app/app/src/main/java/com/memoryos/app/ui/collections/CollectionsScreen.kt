package com.memoryos.app.ui.collections

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.graphics.toColorInt
import androidx.hilt.navigation.compose.hiltViewModel
import com.memoryos.app.data.model.Collection as MemoryCollection
import com.memoryos.app.ui.components.LoadingIndicator
import com.memoryos.app.ui.components.EmptyState

data class CollectionsState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val collections: List<MemoryCollection> = emptyList()
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CollectionsListScreen(
    onCollectionClick: (String) -> Unit,
    onCreateClick: () -> Unit,
    viewModel: CollectionsViewModel = hiltViewModel()
) {
    val state by viewModel.collectionsState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadCollections()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Collections",
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.primary
            )

            FloatingActionButton(
                onClick = onCreateClick,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Create collection"
                )
            }
        }

        when {
            state.isLoading -> {
                LoadingIndicator()
            }

            state.collections.isEmpty() -> {
                EmptyState("No collections yet. Create your first collection!")
            }

            else -> {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(state.collections) { collection ->
                        CollectionCard(
                            collection = collection,
                            onClick = { onCollectionClick(collection.id) }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CollectionCard(
    collection: MemoryCollection,
    onClick: () -> Unit
) {
    val backgroundColor = try {
        Color(collection.color.toColorInt())
    } catch (_: Exception) {
        MaterialTheme.colorScheme.surface
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor
        ),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = collection.name,
                style = MaterialTheme.typography.titleLarge
            )

            Text(
                text = "${collection.itemCount} items",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
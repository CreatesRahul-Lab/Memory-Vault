package com.memoryos.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.memoryos.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthState(
    val isLoading: Boolean = false,
    val isError: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false,
    val userId: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

    fun register(email: String, password: String, name: String) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            val result = authRepository.register(email, password, name)
            result.onSuccess {
                _authState.value = AuthState(isSuccess = true, userId = it.user.id)
            }.onFailure { e ->
                _authState.value = AuthState(
                    isError = true,
                    error = e.message ?: "Registration failed"
                )
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            val result = authRepository.login(email, password)
            result.onSuccess {
                _authState.value = AuthState(isSuccess = true, userId = it.user.id)
            }.onFailure { e ->
                _authState.value = AuthState(
                    isError = true,
                    error = e.message ?: "Login failed"
                )
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _authState.value = AuthState()
        }
    }

    fun resetState() {
        _authState.value = AuthState()
    }
}

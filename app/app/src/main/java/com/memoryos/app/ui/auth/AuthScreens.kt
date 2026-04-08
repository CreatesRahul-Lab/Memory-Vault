package com.memoryos.app.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.memoryos.app.ui.components.*

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val state by viewModel.authState.collectAsState()

    LaunchedEffect(state) {
        when {
            state.isLoading -> isLoading = true
            state.isError -> {
                isLoading = false
                errorMessage = state.error
            }
            state.isSuccess -> {
                isLoading = false
                onLoginSuccess()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Welcome Back",
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        if (errorMessage != null) {
            ErrorMessage(errorMessage!!)
            Spacer(modifier = Modifier.height(16.dp))
        }

        TextInputField(
            value = email,
            onValueChange = { email = it },
            label = "Email",
            keyboardType = KeyboardType.Email,
            imeAction = ImeAction.Next,
            isError = false
        )

        Spacer(modifier = Modifier.height(16.dp))

        PasswordInputField(
            value = password,
            onValueChange = { password = it },
            label = "Password",
            isError = false
        )

        Spacer(modifier = Modifier.height(24.dp))

        PrimaryButton(
            text = "Login",
            onClick = {
                if (email.isNotEmpty() && password.isNotEmpty()) {
                    viewModel.login(email, password)
                } else {
                    errorMessage = "Please fill all fields"
                }
            },
            isLoading = isLoading
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Don't have an account? ", color = MaterialTheme.colorScheme.onSurface)
            ClickableText(
                text = AnnotatedString("Register"),
                style = TextStyle(color = MaterialTheme.colorScheme.primary),
                onClick = { onNavigateToRegister() }
            )
        }
    }
}

@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val state by viewModel.authState.collectAsState()

    LaunchedEffect(state) {
        when {
            state.isLoading -> isLoading = true
            state.isError -> {
                isLoading = false
                errorMessage = state.error
            }
            state.isSuccess -> {
                isLoading = false
                onRegisterSuccess()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Create Account",
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        if (errorMessage != null) {
            ErrorMessage(errorMessage!!)
            Spacer(modifier = Modifier.height(16.dp))
        }

        TextInputField(
            value = name,
            onValueChange = { name = it },
            label = "Full Name",
            imeAction = ImeAction.Next
        )

        Spacer(modifier = Modifier.height(16.dp))

        TextInputField(
            value = email,
            onValueChange = { email = it },
            label = "Email",
            keyboardType = KeyboardType.Email,
            imeAction = ImeAction.Next
        )

        Spacer(modifier = Modifier.height(16.dp))

        PasswordInputField(
            value = password,
            onValueChange = { password = it },
            label = "Password"
        )

        Spacer(modifier = Modifier.height(16.dp))

        PasswordInputField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = "Confirm Password"
        )

        Spacer(modifier = Modifier.height(24.dp))

        PrimaryButton(
            text = "Register",
            onClick = {
                when {
                    name.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty() -> {
                        errorMessage = "Please fill all fields"
                    }
                    password != confirmPassword -> {
                        errorMessage = "Passwords do not match"
                    }
                    password.length < 6 -> {
                        errorMessage = "Password must be at least 6 characters"
                    }
                    else -> {
                        viewModel.register(email, password, name)
                    }
                }
            },
            isLoading = isLoading
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Already have an account? ", color = MaterialTheme.colorScheme.onSurface)
            ClickableText(
                text = AnnotatedString("Login"),
                style = TextStyle(color = MaterialTheme.colorScheme.primary),
                onClick = { onNavigateToLogin() }
            )
        }
    }
}

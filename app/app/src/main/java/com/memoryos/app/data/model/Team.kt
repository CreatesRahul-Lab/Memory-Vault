package com.memoryos.app.data.model

import com.google.gson.annotations.SerializedName

data class Team(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val description: String? = null,
    val color: String = "#e8b931",
    val owner: TeamMemberUser? = null,
    val members: List<TeamMember> = emptyList(),
    val collections: List<String> = emptyList(),
    val isPublic: Boolean = false,
    val inviteCode: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class TeamMember(
    val user: TeamMemberUser? = null,
    val role: String = "viewer",
    val joinedAt: String? = null
)

data class TeamMemberUser(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val email: String = ""
)

data class CreateTeamRequest(
    val name: String,
    val description: String? = null,
    val color: String = "#e8b931"
)

data class TeamDetailResponse(
    val team: Team,
    val collections: List<com.memoryos.app.data.model.Collection>
)

data class AddMemberRequest(
    val email: String,
    val role: String = "viewer"
)

data class RemoveMemberRequest(
    val userId: String
)

data class JoinTeamRequest(
    val inviteCode: String
)

data class TeamUpdateRequest(
    val name: String? = null,
    val description: String? = null,
    val color: String? = null,
    val isPublic: Boolean? = null,
    val addCollection: String? = null,
    val removeCollection: String? = null
)

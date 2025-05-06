// context/UserRolesContext.tsx
import {
  createContext,
  useContext,
  ReactNode,
} from 'react'
import { UserRole, useGetUserRolesQuery } from 'Features/ApiSlices/roleSlice'
import { useGetUserQuery } from 'Features/ApiSlices/userSlice'

interface UserRolesContextValue {
  roles: UserRole[]
  hasRole: (roleType: UserRole['role_type']) => boolean
  getRolesByType: (roleType: UserRole['role_type']) => UserRole[]
  getRoleForObject: (
    roleType: UserRole['role_type'],
    objectId: number,
    contentType: string
  ) => UserRole | undefined
}

const UserRolesContext = createContext<UserRolesContextValue | null>(null)

export const UserRolesProvider = ({ children }: { children: ReactNode }) => {

  const { data: user } = useGetUserQuery()
  const { data: allRoles = [], error } = useGetUserRolesQuery() // хук RTK Query для получения ролей

  const roles = allRoles.filter(role => role.user === user?.user_id)

  const hasRole = (roleType: UserRole['role_type']) =>
    roles.some(r => r.role_type === roleType)

  const getRolesByType = (roleType: UserRole['role_type']) =>
    roles.filter(r => r.role_type === roleType)

  const getRoleForObject = (
    roleType: UserRole['role_type'],
    objectId: number,
    contentType: string
  ) =>
    roles.find(
      r =>
        r.role_type === roleType &&
        r.object_id === objectId &&
        r.content_type === contentType
    )

  if (error) {
    console.error("Ошибка при загрузке ролей", error)
  }

  return (
    <UserRolesContext.Provider
      value={{ roles, hasRole, getRolesByType, getRoleForObject }}
    >
      {children}
    </UserRolesContext.Provider>
  )
}

export const useUserRoles = (): UserRolesContextValue => {
  const context = useContext(UserRolesContext)
  if (!context) {
    throw new Error('useUserRoles must be used within a UserRolesProvider')
  }
  return context
}


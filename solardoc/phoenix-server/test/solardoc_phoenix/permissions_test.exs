defmodule SolardocPhoenix.PermissionsTest do
  use SolardocPhoenix.DataCase

  alias SolardocPhoenix.Permissions

  describe "file_permissions" do
    alias SolardocPhoenix.Permissions.FilePermission

    import SolardocPhoenix.PermissionsFixtures

    @invalid_attrs %{permission: nil}

    test "list_file_permissions/0 returns all file_permissions" do
      file_permission = file_permission_fixture()
      assert Permissions.list_file_permissions() == [file_permission]
    end

    test "get_file_permission!/1 returns the file_permission with given id" do
      file_permission = file_permission_fixture()
      assert Permissions.get_file_permission!(file_permission.id) == file_permission
    end

    test "create_file_permission/1 with valid data creates a file_permission" do
      valid_attrs = %{permission: 42}

      assert {:ok, %FilePermission{} = file_permission} = Permissions.create_file_permission(valid_attrs)
      assert file_permission.permission == 42
    end

    test "create_file_permission/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Permissions.create_file_permission(@invalid_attrs)
    end

    test "update_file_permission/2 with valid data updates the file_permission" do
      file_permission = file_permission_fixture()
      update_attrs = %{permission: 43}

      assert {:ok, %FilePermission{} = file_permission} = Permissions.update_file_permission(file_permission, update_attrs)
      assert file_permission.permission == 43
    end

    test "update_file_permission/2 with invalid data returns error changeset" do
      file_permission = file_permission_fixture()
      assert {:error, %Ecto.Changeset{}} = Permissions.update_file_permission(file_permission, @invalid_attrs)
      assert file_permission == Permissions.get_file_permission!(file_permission.id)
    end

    test "delete_file_permission/1 deletes the file_permission" do
      file_permission = file_permission_fixture()
      assert {:ok, %FilePermission{}} = Permissions.delete_file_permission(file_permission)
      assert_raise Ecto.NoResultsError, fn -> Permissions.get_file_permission!(file_permission.id) end
    end

    test "change_file_permission/1 returns a file_permission changeset" do
      file_permission = file_permission_fixture()
      assert %Ecto.Changeset{} = Permissions.change_file_permission(file_permission)
    end
  end
end

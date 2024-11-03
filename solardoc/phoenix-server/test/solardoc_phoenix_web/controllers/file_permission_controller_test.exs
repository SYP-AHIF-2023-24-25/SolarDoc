defmodule SolardocPhoenixWeb.V2FilePermissionControllerTest do
  use SolardocPhoenixWeb.ConnCase

  import SolardocPhoenix.PermissionsFixtures

  alias SolardocPhoenix.Permissions.FilePermission

  @create_attrs %{
    permission: 42
  }
  @update_attrs %{
    permission: 43
  }
  @invalid_attrs %{permission: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all file_permissions", %{conn: conn} do
      conn = get(conn, ~p"/api/file_permissions")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create file_permission" do
    test "renders file_permission when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/file_permissions", file_permission: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/file_permissions/#{id}")

      assert %{
               "id" => ^id,
               "permission" => 42
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/file_permissions", file_permission: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update file_permission" do
    setup [:create_file_permission]

    test "renders file_permission when data is valid", %{conn: conn, file_permission: %FilePermission{id: id} = file_permission} do
      conn = put(conn, ~p"/api/file_permissions/#{file_permission}", file_permission: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/file_permissions/#{id}")

      assert %{
               "id" => ^id,
               "permission" => 43
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, file_permission: file_permission} do
      conn = put(conn, ~p"/api/file_permissions/#{file_permission}", file_permission: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete file_permission" do
    setup [:create_file_permission]

    test "deletes chosen file_permission", %{conn: conn, file_permission: file_permission} do
      conn = delete(conn, ~p"/api/file_permissions/#{file_permission}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/file_permissions/#{file_permission}")
      end
    end
  end

  defp create_file_permission(_) do
    file_permission = file_permission_fixture()
    %{file_permission: file_permission}
  end
end

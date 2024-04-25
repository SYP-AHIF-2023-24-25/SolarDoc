defmodule SolardocPhoenixWeb.ShareURLControllerTest do
  use SolardocPhoenixWeb.ConnCase

  import SolardocPhoenix.ShareFixtures

  alias SolardocPhoenix.Share.ShareURL

  @create_attrs %{
    file: "some file",
    expired: true,
    issued_at: ~N[2024-03-21 07:45:00],
    perms: 42,
    expires_at: ~N[2024-03-21 07:45:00]
  }
  @update_attrs %{
    file: "some updated file",
    expired: false,
    issued_at: ~N[2024-03-22 07:45:00],
    perms: 43,
    expires_at: ~N[2024-03-22 07:45:00]
  }
  @invalid_attrs %{file: nil, expired: nil, issued_at: nil, perms: nil, expires_at: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all sahre_urls", %{conn: conn} do
      conn = get(conn, ~p"/api/sahre_urls")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create share_url" do
    test "renders share_url when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/sahre_urls", share_url: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/sahre_urls/#{id}")

      assert %{
               "id" => ^id,
               "expired" => true,
               "expires_at" => "2024-03-21T07:45:00",
               "file" => "some file",
               "issued_at" => "2024-03-21T07:45:00",
               "perms" => 42
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/sahre_urls", share_url: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update share_url" do
    setup [:create_share_url]

    test "renders share_url when data is valid", %{conn: conn, share_url: %ShareURL{id: id} = share_url} do
      conn = put(conn, ~p"/api/sahre_urls/#{share_url}", share_url: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/sahre_urls/#{id}")

      assert %{
               "id" => ^id,
               "expired" => false,
               "expires_at" => "2024-03-22T07:45:00",
               "file" => "some updated file",
               "issued_at" => "2024-03-22T07:45:00",
               "perms" => 43
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, share_url: share_url} do
      conn = put(conn, ~p"/api/sahre_urls/#{share_url}", share_url: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete share_url" do
    setup [:create_share_url]

    test "deletes chosen share_url", %{conn: conn, share_url: share_url} do
      conn = delete(conn, ~p"/api/sahre_urls/#{share_url}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/sahre_urls/#{share_url}")
      end
    end
  end

  defp create_share_url(_) do
    share_url = share_url_fixture()
    %{share_url: share_url}
  end
end

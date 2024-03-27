defmodule SolardocPhoenix.ShareTest do
  use SolardocPhoenix.DataCase

  alias SolardocPhoenix.Share

  describe "sahre_urls" do
    alias SolardocPhoenix.Share.ShareURL

    import SolardocPhoenix.ShareFixtures

    @invalid_attrs %{file: nil, expired: nil, issued_at: nil, perms: nil, expires_at: nil}

    test "list_sahre_urls/0 returns all sahre_urls" do
      share_url = share_url_fixture()
      assert Share.list_sahre_urls() == [share_url]
    end

    test "get_share_url!/1 returns the share_url with given id" do
      share_url = share_url_fixture()
      assert Share.get_share_url!(share_url.id) == share_url
    end

    test "create_share_url/1 with valid data creates a share_url" do
      valid_attrs = %{file: "some file", expired: true, issued_at: ~N[2024-03-21 07:45:00], perms: 42, expires_at: ~N[2024-03-21 07:45:00]}

      assert {:ok, %ShareURL{} = share_url} = Share.create_share_url(valid_attrs)
      assert share_url.file == "some file"
      assert share_url.expired == true
      assert share_url.issued_at == ~N[2024-03-21 07:45:00]
      assert share_url.perms == 42
      assert share_url.expires_at == ~N[2024-03-21 07:45:00]
    end

    test "create_share_url/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Share.create_share_url(@invalid_attrs)
    end

    test "update_share_url/2 with valid data updates the share_url" do
      share_url = share_url_fixture()
      update_attrs = %{file: "some updated file", expired: false, issued_at: ~N[2024-03-22 07:45:00], perms: 43, expires_at: ~N[2024-03-22 07:45:00]}

      assert {:ok, %ShareURL{} = share_url} = Share.update_share_url(share_url, update_attrs)
      assert share_url.file == "some updated file"
      assert share_url.expired == false
      assert share_url.issued_at == ~N[2024-03-22 07:45:00]
      assert share_url.perms == 43
      assert share_url.expires_at == ~N[2024-03-22 07:45:00]
    end

    test "update_share_url/2 with invalid data returns error changeset" do
      share_url = share_url_fixture()
      assert {:error, %Ecto.Changeset{}} = Share.update_share_url(share_url, @invalid_attrs)
      assert share_url == Share.get_share_url!(share_url.id)
    end

    test "delete_share_url/1 deletes the share_url" do
      share_url = share_url_fixture()
      assert {:ok, %ShareURL{}} = Share.delete_share_url(share_url)
      assert_raise Ecto.NoResultsError, fn -> Share.get_share_url!(share_url.id) end
    end

    test "change_share_url/1 returns a share_url changeset" do
      share_url = share_url_fixture()
      assert %Ecto.Changeset{} = Share.change_share_url(share_url)
    end
  end
end

defmodule SolardocPhoenix.UpdateChannelTest do
  use SolardocPhoenix.DataCase

  alias SolardocPhoenix.UpdateChannel

  describe "channels" do
    alias SolardocPhoenix.UpdateChannel.Channel

    import SolardocPhoenix.UpdateChannelFixtures

    @invalid_attrs %{id: nil, name: nil, description: nil, activeSince: nil, creator: nil}

    test "list_channels/0 returns all channels" do
      channel = channel_fixture()
      assert UpdateChannel.list_channels() == [channel]
    end

    test "get_channel!/1 returns the channel with given id" do
      channel = channel_fixture()
      assert UpdateChannel.get_channel!(channel.id) == channel
    end

    test "create_channel/1 with valid data creates a channel" do
      valid_attrs = %{id: "7488a646-e31f-11e4-aace-600308960662", name: "some name", description: "some description", activeSince: ~D[2024-03-06], creator: "some creator"}

      assert {:ok, %Channel{} = channel} = UpdateChannel.create_channel(valid_attrs)
      assert channel.id == "7488a646-e31f-11e4-aace-600308960662"
      assert channel.name == "some name"
      assert channel.description == "some description"
      assert channel.activeSince == ~D[2024-03-06]
      assert channel.creator == "some creator"
    end

    test "create_channel/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = UpdateChannel.create_channel(@invalid_attrs)
    end

    test "update_channel/2 with valid data updates the channel" do
      channel = channel_fixture()
      update_attrs = %{id: "7488a646-e31f-11e4-aace-600308960668", name: "some updated name", description: "some updated description", activeSince: ~D[2024-03-07], creator: "some updated creator"}

      assert {:ok, %Channel{} = channel} = UpdateChannel.update_channel(channel, update_attrs)
      assert channel.id == "7488a646-e31f-11e4-aace-600308960668"
      assert channel.name == "some updated name"
      assert channel.description == "some updated description"
      assert channel.activeSince == ~D[2024-03-07]
      assert channel.creator == "some updated creator"
    end

    test "update_channel/2 with invalid data returns error changeset" do
      channel = channel_fixture()
      assert {:error, %Ecto.Changeset{}} = UpdateChannel.update_channel(channel, @invalid_attrs)
      assert channel == UpdateChannel.get_channel!(channel.id)
    end

    test "delete_channel/1 deletes the channel" do
      channel = channel_fixture()
      assert {:ok, %Channel{}} = UpdateChannel.delete_channel(channel)
      assert_raise Ecto.NoResultsError, fn -> UpdateChannel.get_channel!(channel.id) end
    end

    test "change_channel/1 returns a channel changeset" do
      channel = channel_fixture()
      assert %Ecto.Changeset{} = UpdateChannel.change_channel(channel)
    end
  end
end

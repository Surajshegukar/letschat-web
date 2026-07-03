import { Channel } from "@/types/channels";
import { INITIAL_CHANNELS } from "@/data/channels-data";

export const channelsService = {
  getChannels(): Promise<Channel[]> {
    return Promise.resolve(INITIAL_CHANNELS);
  }
};

export interface FFprobOutput {
  streams: MediaMetaData[];
}

export interface MediaMetaData {
  index: number;
  codec_name: string;
  codec_long_name: string;
  profile: string;
  codec_type: string;
  codec_time_base: string;
  codec_tag_string: string;
  codec_tag: string;
  width: number | undefined;
  height: number | undefined;
  coded_width: number | undefined;
  coded_height: number | undefined;
  has_b_frames: number | undefined;
  sample_aspect_ratio: string | undefined;
  display_aspect_ratio: string | undefined;
  pix_fmt: string | undefined;
  level: number | undefined;
  color_range: string | undefined;
  color_space: string | undefined;
  color_transfer: string | undefined;
  color_primaries: string | undefined;
  chroma_location: string | undefined;
  refs: number | undefined;
  is_avc: string | undefined;
  nal_length_size: string | undefined;
  sample_fmt: string | undefined;
  sample_rate: string | undefined;
  channels: number | undefined;
  channel_layout: string | undefined;
  bits_per_sample: number | undefined;
  r_frame_rate: string | undefined;
  avg_frame_rate: string;
  time_base: string;
  start_pts: number;
  start_time: string;
  duration_ts: number;
  duration: string;
  bit_rate: string;
  bits_per_raw_sample: string | undefined;
  max_bit_rate: string | undefined;
  nb_frames: string;
  disposition: {
    default: number;
    dub: number;
    original: number;
    comment: number;
    lyrics: number;
    karaoke: number;
    forced: number;
    hearing_impaired: number;
    visual_impaired: number;
    clean_effects: number;
    attached_pic: number;
    timed_thumbnails: number;
  };
  tags: {
    language: string;
    handler_name: string;
    rotate: string | undefined;
  };
}

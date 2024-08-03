import { Frame } from "ocr/util/frame";

export abstract class VideoSource {

    /**
     * Gets the next raw frame from the video source.
     */
    abstract getNextFrame(): Promise<Frame>;

}
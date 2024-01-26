import cv2 as cv
import numpy as np
from moviepy import editor

def apply_lane_mask(img):
    hsl = cv.cvtColor(img, cv.COLOR_BGR2HLS)
    lower_yellow = np.uint8([10, 0, 100])
    upper_yellow = np.uint8([40, 255, 255])
    mask_yellow = cv.inRange(hsl, lower_yellow, upper_yellow)
    lower_white = np.uint8([0, 200, 0])
    upper_white = np.uint8([255, 255, 255])
    mask_white = cv.inRange(hsl, lower_white, upper_white)
    combined_mask = cv.bitwise_or(mask_white, mask_yellow)
    img = cv.bitwise_and(hsl, hsl, mask=combined_mask)
    return cv.cvtColor(img, cv.COLOR_HLS2BGR)

def apply_canny_edges(img):
    img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    img = cv.GaussianBlur(img, (7, 7), 0)
    lower_threshold = 50
    upper_threshold = 100
    img = cv.Canny(img, lower_threshold, upper_threshold)
    return img

def apply_hough_transform(img):
    rho = 1
    theta = np.pi/180
    threshold = 20
    min_line_length = 20
    max_line_gap = 500
    lines = cv.HoughLinesP(img, rho=rho, theta=theta, threshold=threshold, minLineLength=min_line_length, maxLineGap=max_line_gap)
    return lines

def calculate_average_slope_intercept(lines):
    left_lines = []
    left_weights = []
    right_lines = []
    right_weights = []
    for line in lines:
        for x1, y1, x2, y2 in line:
            if x1 == x2:
                continue
            slope = (y2 - y1) / (x2 - x1)
            intercept = y1 - (slope * x1)
            length = np.sqrt((y2 - y1)**2 + (x2 - x1)**2)
            if slope < 0:
                left_lines.append((slope, intercept))
                left_weights.append(length)
            else:
                right_lines.append((slope, intercept))
                right_weights.append(length)
    left_lane = np.dot(left_weights, left_lines) / sum(left_weights) if left_weights else None
    right_lane = np.dot(right_weights, right_lines) / sum(right_weights) if right_weights else None
    return left_lane, right_lane

def calculate_pixel_points(y1, y2, line):
    if line is None:
        return None
    slope, intercept = line
    try:
        x1 = int((y1 - intercept) / slope)
        x2 = int((y2 - intercept) / slope)
    except:
        x1 = int((y1 - intercept))
        x2 = int((y2 - intercept))
    y1, y2 = int(y1), int(y2)
    return ((x1, y1), (x2, y2))

def extract_lane_lines(image, lines):
    left_lane, right_lane = calculate_average_slope_intercept(lines)
    y1 = image.shape[0]
    y2 = int(y1 * 0.6)
    left_line = calculate_pixel_points(y1, y2, left_lane)
    right_line = calculate_pixel_points(y1, y2, right_lane)
    return left_line, right_line

def draw_lane_lines_on_image(image, lines, color=[255, 0, 0], thickness=12):
    line_image = np.zeros_like(image)
    for line in lines:
        if line is not None:
            cv.line(line_image, *line, color, thickness)
    return cv.addWeighted(image, 1.0, line_image, 1.0, 0.0)

def apply_region_of_interest(image):
    mask = np.zeros_like(image)
    if len(image.shape) > 2:
        channel_count = image.shape[2]
        ignore_mask_color = (255,) * channel_count
    else:
        ignore_mask_color = 255
    rows, cols = image.shape[:2]
    bottom_left = [cols * 0.1, rows * 0.95]
    top_left = [cols * 0.4, rows * 0.6]
    bottom_right = [cols * 0.9, rows * 0.95]
    top_right = [cols * 0.6, rows * 0.6]
    vertices = np.array([[bottom_left, top_left, top_right, bottom_right]], dtype=np.int32)
    cv.fillPoly(mask, vertices, ignore_mask_color)
    masked_image = cv.bitwise_and(image, mask)
    return masked_image

def process_video(input_video_path, output_video_path):
    input_video = editor.VideoFileClip(input_video_path, audio=False)
    processed = input_video.fl_image(process_frame)
    processed.write_videofile(output_video_path, audio=False)

def process_frame(frame):
    masked_frame = apply_lane_mask(frame)
    canny_edge_frame = apply_canny_edges(masked_frame)
    region_frame = apply_region_of_interest(canny_edge_frame)
    hough_lines = apply_hough_transform(region_frame)
    frame_with_lines = draw_lane_lines_on_image(frame, extract_lane_lines(frame, hough_lines), color=[0, 0, 255])
    return frame_with_lines

def process_img(path):
    frame = cv.imread(path);
    masked_frame = apply_lane_mask(frame)
    canny_edge_frame = apply_canny_edges(masked_frame)
    region_frame = apply_region_of_interest(canny_edge_frame)
    hough_lines = apply_hough_transform(region_frame)
    frame_with_lines = draw_lane_lines_on_image(frame, extract_lane_lines(frame, hough_lines), color=[0, 0, 255])
    cv.imwrite('./backend/output.jpg', frame_with_lines);

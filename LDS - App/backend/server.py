from flask import Flask, request, send_file
import os
import main

app = Flask(__name__)

# API Route
@app.route('/members')
def members():
    return {"Members": ["Mem1", "Mem2", "Mem3"]}

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        print("Error")
    file_path = ""
    file = request.files['file']
    _, file_extension = os.path.splitext(file.filename)
    if(file_extension==".mp4"):
        file.save('./backend/video.mp4')
        main.process_video('./backend/video.mp4', './backend/output.mp4')
        file_path = 'output.mp4'
    else:
        file.save('./backend/image.jpg')
        main.process_img('./backend/image.jpg')
        file_path = 'output.jpg'
    return send_file(file_path, as_attachment=True)

if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True)
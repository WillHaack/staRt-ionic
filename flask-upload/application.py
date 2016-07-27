import os
from flask import Flask, request, redirect, url_for
from werkzeug import secure_filename

app = Flask(__name__)
path = os.path.abspath(__file__)
dir_path = os.path.dirname(path)
UPLOAD_FOLDER = dir_path + "/uploads/"

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        filename = UPLOAD_FOLDER + request.headers['filename']
        with open(filename, "w+") as f:
            f.write(request.stream.read())
        return '''
        <!doctype html>
        <title>So far so good</title>
        '''
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form action="" method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''

if __name__ == "__main__":
    app.run()

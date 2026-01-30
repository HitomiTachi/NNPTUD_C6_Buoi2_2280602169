LoadData();
LoadComments();

// ========== POSTS FUNCTIONS ==========
async function LoadData() {
    //async await 
    //HTTP Request GET, GET1, PUT, POST, DELETE
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        let body = document.getElementById('post-body')
        body.innerHTML = "";
        for (const post of posts) {
            body.innerHTML += convertDataToHTML(post);
        }
    } catch (error) {
        console.log(error);
    }
}

function convertDataToHTML(post) {
    const isDeleted = post.isDeleted === true;
    const style = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
    return `<tr ${style}>
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.views}</td>
        <td>
            <input type='submit' value='delete' onclick='Delete("${post.id}")'/>
            ${isDeleted ? '<span style="color: red;">(Đã xóa)</span>' : ''}
        </td>
    </tr>`
}

async function getMaxPostId() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        if (posts.length === 0) return "0";
        let maxId = Math.max(...posts.map(p => parseInt(p.id) || 0));
        return String(maxId + 1);
    } catch (error) {
        console.log(error);
        return "1";
    }
}

async function saveData() {
    let id = document.getElementById("id_txt").value.trim();
    let title = document.getElementById("title_txt").value;
    let view = document.getElementById('views_txt').value;
    
    // Nếu ID trống, tạo mới với ID tự động tăng
    if (!id) {
        id = await getMaxPostId();
        let resPOST = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                title: title,
                views: view,
                isDeleted: false
            })
        });
        if (resPOST.ok) {
            console.log("Tạo mới thành công");
            document.getElementById("id_txt").value = "";
            document.getElementById("title_txt").value = "";
            document.getElementById('views_txt').value = "";
            LoadData();
        }
        return false;
    }
    
    // Nếu có ID, kiểm tra xem có tồn tại không để update
    let resGET = await fetch('http://localhost:3000/posts/' + id);
    if (resGET.ok) {
        let existingPost = await resGET.json();
        let resPUT = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                title: title,
                views: view,
                isDeleted: existingPost.isDeleted || false
            })
        });
        if (resPUT.ok) {
            console.log("Cập nhật thành công");
            LoadData();
        }
        return false;
    } else {
        // Nếu không tồn tại, tạo mới với ID đã nhập
        let resPOST = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                title: title,
                views: view,
                isDeleted: false
            })
        });
        if (resPOST.ok) {
            console.log("Tạo mới thành công");
            LoadData();
        }
        return false;
    }
}

async function Delete(id) {
    // Xóa mềm: thêm isDeleted: true
    try {
        let resGET = await fetch('http://localhost:3000/posts/' + id);
        if (resGET.ok) {
            let post = await resGET.json();
            let resPUT = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...post,
                    isDeleted: true
                })
            });
            if (resPUT.ok) {
                console.log("Xóa mềm thành công");
                LoadData();
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// ========== COMMENTS FUNCTIONS ==========
async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        let body = document.getElementById('comment-body');
        if (body) {
            body.innerHTML = "";
            for (const comment of comments) {
                body.innerHTML += convertCommentToHTML(comment);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function convertCommentToHTML(comment) {
    const isDeleted = comment.isDeleted === true;
    const style = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
    return `<tr ${style}>
        <td>${comment.id}</td>
        <td>${comment.text}</td>
        <td>${comment.postId}</td>
        <td>
            <input type='submit' value='Sửa' onclick='editComment("${comment.id}")'/>
            <input type='submit' value='Xóa' onclick='deleteComment("${comment.id}")'/>
            ${isDeleted ? '<span style="color: red;">(Đã xóa)</span>' : ''}
        </td>
    </tr>`
}

async function getMaxCommentId() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        if (comments.length === 0) return "0";
        let maxId = Math.max(...comments.map(c => parseInt(c.id) || 0));
        return String(maxId + 1);
    } catch (error) {
        console.log(error);
        return "1";
    }
}

async function saveComment() {
    let id = document.getElementById("comment_id_txt").value.trim();
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;
    
    if (!text || !postId) {
        alert("Vui lòng nhập đầy đủ thông tin comment!");
        return false;
    }
    
    // Nếu ID trống, tạo mới với ID tự động tăng
    if (!id) {
        id = await getMaxCommentId();
        let resPOST = await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                text: text,
                postId: postId,
                isDeleted: false
            })
        });
        if (resPOST.ok) {
            console.log("Tạo comment thành công");
            document.getElementById("comment_id_txt").value = "";
            document.getElementById("comment_text_txt").value = "";
            document.getElementById("comment_postId_txt").value = "";
            LoadComments();
        }
        return false;
    }
    
    // Nếu có ID, kiểm tra xem có tồn tại không để update
    let resGET = await fetch('http://localhost:3000/comments/' + id);
    if (resGET.ok) {
        let existingComment = await resGET.json();
        let resPUT = await fetch('http://localhost:3000/comments/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                text: text,
                postId: postId,
                isDeleted: existingComment.isDeleted || false
            })
        });
        if (resPUT.ok) {
            console.log("Cập nhật comment thành công");
            LoadComments();
        }
        return false;
    } else {
        // Nếu không tồn tại, tạo mới với ID đã nhập
        let resPOST = await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                text: text,
                postId: postId,
                isDeleted: false
            })
        });
        if (resPOST.ok) {
            console.log("Tạo comment thành công");
            LoadComments();
        }
        return false;
    }
}

async function editComment(id) {
    try {
        let res = await fetch('http://localhost:3000/comments/' + id);
        if (res.ok) {
            let comment = await res.json();
            document.getElementById("comment_id_txt").value = comment.id;
            document.getElementById("comment_text_txt").value = comment.text;
            document.getElementById("comment_postId_txt").value = comment.postId;
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteComment(id) {
    // Xóa mềm: thêm isDeleted: true
    try {
        let resGET = await fetch('http://localhost:3000/comments/' + id);
        if (resGET.ok) {
            let comment = await resGET.json();
            let resPUT = await fetch('http://localhost:3000/comments/' + id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...comment,
                    isDeleted: true
                })
            });
            if (resPUT.ok) {
                console.log("Xóa mềm comment thành công");
                LoadComments();
            }
        }
    } catch (error) {
        console.log(error);
    }
}
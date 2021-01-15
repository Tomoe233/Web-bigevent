$(function() {
    var form = layui.form
    var layer = layui.layer

    form.verify({
        pass: [
            /^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'
        ],
        samePass: function(value) {
            if (value === $('[name=oldPwd]').val()) {
                return '与旧密码相同，请重新输入！'
            }
        },
        rePass: function(value) {
            if (value !== $('[name=newPwd]').val()) {
                return '两次密码不一致，请重新输入！'
            }
        }
    })

    $('.layui-form').on('submit', function(e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/my/updatepwd',
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layui.layer.msg('更新密码失败！')
                }
                layui.layer.msg('更新密码成功！');
                // 重置表单
                $('.layui-form')[0].reset()
            }
        })
    })
})
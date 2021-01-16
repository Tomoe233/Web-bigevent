$(function() {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date)

        var y = dt.getFullYear()
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定义一个查询的参数，将来请求数据的时候，需要将请求的参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值，默认请求第一页数据
        pagesize: 2, // 每页显示几条数据，默认每页显示2条
        cate_id: '', // 文章的分类
        state: '' // 文章的发布状态
    }

    initTable()
    initCate()

    // 获取文章列表数据
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                // 使用模版引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr);
                // 调用渲染分页
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！')
                }
                // 调用模版引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id').html(htmlStr);
                // 通知 layui 重新渲染表单区域的UI结构
                form.render()
            }
        })
    }

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault();
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        // 为查询参数对象 q 中的对应属性赋值
        q.cate_id = cate_id;
        q.state = state;
        // 根据最新的筛选条件，重新渲染表格的数据
        initTable();
    })

    // 定义渲染分页
    function renderPage(total) {
        laypage.render({
            elem: 'pageBox', // 分页容器 Id
            count: total, // 总数据条数
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum, // 设置默认被选中分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页切换触发
            // 触发 jump 回调的方式
            // 1、点击页码时
            // 2、调用了 laypage().render()
            jump: function(obj, first) {
                // 可以通过 first 的值，判断通过哪种方式触发 jump 回调
                // 如果为 true 触发方式为2
                // 否则触发方式为1
                // console.log(first);
                // 把最新的页码值赋值到 q 这个查询参数中
                q.pagenum = obj.curr;
                // 把最新的条目数，赋值到q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit;
                // 根据最新的 q 获取对应的数据列表，并渲染表格
                // initTable()
                if (!first) {
                    initTable()
                }
            }
        })
    }

    // 通过代理的形式，为删除按钮绑定点击事件处理函数
    $('tbody').on('click', '.btn-delete', function() {
        // 获取删除按钮的个数
        var len = $('.btn-delete').length;
        // 获取文章的 Id
        var id = $(this).attr('data-id')
            // 询问用户是否要删除数据
        layer.confirm('确认删除？', { icon: 3, title: '提示' }, function(index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！');
                    // 当数据删除完成后，需要判断当前这一页中是否还有剩余数据
                    // 如果没有剩余数据，则让页码值-1
                    // 再调用initTable()
                    if (len === 1) {
                        // 如果 len 的值等于1，证明删除完毕后，页面上无数据
                        // 页码值最小必须是 1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index);
        });
    })
})
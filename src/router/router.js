

export const appRouter = [
    {
        path: '/', 
        redirect:"/home",
        component: resolve => {
            require(['@/pages/home.vue'], resolve)
        },
    },
    {
        path: '/home',
        name: 'home',
        meta: {
            requireAuth: false,
        },
        component: resolve => {
            require(['@/pages/home.vue'], resolve)
        },

    },
    {
        path: "/courseList/:listType",//课程list
        name: 'courseList',
        meta: {
            requireAuth: false,
        },
        component: resolve => {
            require(['@/pages/course-list.vue'], resolve)
        }
    },
    {
        path: "/learnPage/:courseId",//学习页面
        name: 'learnPage',
        meta: {
            requireAuth: false,
        },
        component: resolve => {
            require(['@/pages/learn-page.vue'], resolve)
        }
    },
    {
        path: "/courseManage",//课程管理
        name: 'courseManage',
        meta: {
            requireAuth: true,
        },
        redirect: "/courseManage/createdCourse",
        component: resolve => {
            require(['@/pages/course-manage.vue'], resolve)
        },
        children: [
            {
                path: 'createdCourse',
                name: 'createdCourse',//编辑中课程
                meta: {
                    requireAuth: true,
                },
                component: resolve => {
                    require(['@/pages/course-manage/created-course.vue'], resolve)
                },
            },
            {
                path: 'publishCourse',
                name: 'publishCourse',//已通过课程
           
                meta: {
                    requireAuth: true,
                },
                component: resolve => {
                    require(['@/pages/course-manage/publish-course.vue'], resolve)
                },       
            },
            {
                path: 'checkCourse',
                name: 'checkCourse',//审核中课程
                meta: {
                    requireAuth: false,
                },
                component: resolve => {
                    require(['@/pages/course-manage/check-course.vue'], resolve)
                },
            }

        ]
    },
    {
        path: '/courseSet/:pageType',//新建课程 pageType: 0修改页面 1 新建页面
        name: 'courseSet',
        meta: {
            requireAuth: true,
        },
        component: resolve => {
            require(['@/pages/course-set.vue'], resolve)
        }
    },
    {
        path: '/courseInfoView',
        name: 'courseInfoView',
        meta: {
            requireAuth: true,
        },
        component: resolve => {
            require(['@/pages/course-info-view.vue'], resolve)
        }
    },
    {
        path: '/questionBank',//题库
        name: 'questionBank',
        meta: {
            requireAuth: true,
        },
        component: resolve => {
            require(['@/pages/question/question-bank.vue'], resolve)
        }
    },
    // {
    //     path: '/examination', //考试页面
    //     name: 'examination',
    //     meta: {
    //         requireAuth: false,
    //     },
    //     component: resolve => {
    //         require(['@/pages/examination.vue'], resolve)
    //     }
    // },
    {
        path: '/examPage', //考试页面
        name: 'examPage',
        meta: {
            requireAuth: false,
        },
        component: resolve => {
            require(['@/pages/exam-page.vue'], resolve)
        }
    },
    {
        path: '/perLearnRecord', //个人培训记录
        name: 'perLearnRecord',
        meta: {
            requireAuth: false,
        },
        component: resolve => {
            require(['@/pages/per-learn-record.vue'], resolve)
        }
    },
    {
        path: '/learnReport', //培训报表
        name: 'learnReport',
        meta: {
            requireAuth: true,
        },
        component: resolve => {
            require(['@/pages/learn-report.vue'], resolve)
        }
    },

    {
        path: '/systemManage', //系统管理
        name: 'systemManage',
        meta: {
            requireAuth: true,
        },
        component: resolve => {
            require(['@/pages/system-manage.vue'], resolve)
        }
    }
]

export const routers = [
    ...appRouter
]
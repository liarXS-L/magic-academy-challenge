# 贡献指南

感谢你对「魔法学院大挑战」项目的关注！欢迎提交 Issue 和 Pull Request。

## 提交代码前

1. 确保代码符合项目的 TypeScript 规范
2. 运行 `npm run lint` 检查代码风格
3. 运行 `npm run build:h5` 确保构建通过

## 提交规范

我们使用 Conventional Commits 规范：

```
<类型>(<范围>): <描述>

<详细说明>

<页脚>
```

### 类型

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（不影响功能）
- `test`: 测试
- `chore`: 构建/工具脚本

### 示例

```
feat(game): 添加连击特效

- 实现 ComboDisplay 组件
- 添加连击倍数计算逻辑
- 更新游戏逻辑处理连锁消除
```

## Issue 规范

### Bug 报告

```
**问题描述**
清晰描述问题

**复现步骤**
1. 步骤一
2. 步骤二
3. 步骤三

**预期结果**
描述预期的行为

**实际结果**
描述实际发生的行为

**环境信息**
- 平台: H5/微信小程序/支付宝小程序
- 浏览器/设备: Chrome 120 / iPhone 14
```

### 功能请求

```
**功能描述**
清晰描述想要的功能

**使用场景**
描述使用该功能的场景

**优先级**
- [ ] 高
- [ ] 中
- [ ] 低
```

## 开发环境

```bash
# 安装依赖
npm install

# 开发模式
npm run dev:h5

# 构建
npm run build:h5

# 检查代码风格
npm run lint
```

## 项目结构

```
src/
├── components/    # 公共组件
├── pages/         # 页面
├── data/          # Mock 数据
├── utils/         # 工具函数
├── types/         # TypeScript 类型定义
└── styles/        # 全局样式
```

## 提交步骤

1. Fork 项目
2. 创建功能分支 `git checkout -b feat/my-feature`
3. 提交代码 `git commit -m "feat: 描述功能"`
4. 推送分支 `git push origin feat/my-feature`
5. 创建 Pull Request

## 代码审查

所有 Pull Request 需要经过审查后才能合并。请确保：

- 代码逻辑清晰
- 有适当的注释
- 通过所有测试
- 没有 breaking changes

---

再次感谢你的贡献！🎉

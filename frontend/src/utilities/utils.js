export const filterTasks = (tasks) => {
  // Labels -> Bug, fix, refactor, review, feature, todo, communication, design and other (for the ambiguous ones, which will be deleted as a label later)
  const labelMappings = {
    bug: "bug", invalid: "fix", "🔨refactor": "refactor", "↩️ review": "review", enhancement: "feature", "🧹chore": "review", "💼 internal": "review", design: "design", feature: "feature", java: "feature", "c#": "feature", bitbucket: "feature", documentation: "review", need_feedback: "communication", php: "feature", github: "feature", "🚧 wait others": "communication", gitlab: "feature", python: "feature", "azure devops": "feature", "social media": "todo", planning: "review", newsletter: "todo", duplicate: "refactor", internal: "todo", website: "todo", "content creation": "todo", js: "feature", "gitlab-private": "feature", testing: "review", Backlog: "other", Publication: "review", Upcoming: "feature", Management: "todo", Devops: "feature", SW: "todo", Web: "todo", Accepted: "other", "Under review": "review", Submitted: "other", HW: "todo", Deliverable: "todo", "Sprint 3": "feature", "Sprint 4": "feature", Sprint: "feature", "Sprint 2": "feature", "Sprint 1": "feature", Published: "other", "Design-Print": "design", Other: "other", "version 2.0": "other", "version 3.0": "other", "back-end": "other", "main task": "feature", "front-end": "other", investigation: "review", "In progress": "other", question: "communication", exploration: "feature", "help wanted": "communication", test: "review", chore: "todo", dependency: "fix", "stream-sim": "feature", Document: "review", "tektrain-api": "todo", UI: "other", "#not-yet": "other", urgent: "fix", AUTH: "other", Delivered: "other", usability: "fix", paas: "fix", "New sprint": "feature", wontfix: "fix", MustFix: "fix", Platform: "other", null: "other"
  }

  const priorityMappings = { none: 0, low: 1, medium: 2, high: 3 }

  // No points tasks or super fast ones
  tasks = tasks.filter((task) => !(task?.points && task?.points?.total === 0 && task?.points?.done === 0))

  for (const task of tasks) {
    const { pointsEstimatedEdits = [], pointsBurnedEdits = [], points = {}, statusEdits = [], labels = [], dueDate = null, priority = "none", comments = [], commits = []} = task

    task.pointsEstimatedNumberOfEdits = pointsEstimatedEdits?.length || 0
    task.pointsEstimatedEditsTotalDifference = pointsEstimatedEdits?.length > 0
      ? pointsEstimatedEdits.at(-1).toPoints - pointsEstimatedEdits[0].fromPoints
      : 0
    task.pointsBurnedNumberOfEdits = pointsBurnedEdits?.length || 0
    task.numberOfLabels = labels?.length || 0 // Count labels before the alignment
    task.labels = [...new Set(labels.map((label) => labelMappings[label] || label).filter((mappedLabel) => mappedLabel !== "other"))] // Align labels and filter out ambiguous ones
    task.priority = priorityMappings[priority]
    task.dueDate = dueDate === null ? 0 : 1 // 1 is for the tasks with deadline
    task.expectedPoints = Math.round(points?.total * 2) / 2 // round up to 0.5
    task.burnedPoints = Math.round(points?.done * 2) / 2 // round up to 0.5
    task.numberOfComments = comments?.length || 0
    task.numberOfCommits = commits?.length || 0

    // Calculate total file changes (additions and deletions) and count number of file changes
    const fileChanges = commits.reduce((acc, commit) => {
      commit.files.forEach(file => {
        acc.additions += file?.additions || 0
        acc.deletions += file?.deletions || 0
        acc.filesChanged += 1 // Increment for each file change
      })
      return acc
    }, { additions: 0, deletions: 0, filesChanged: 0 })

    task.totalAdditions = fileChanges.additions
    task.totalDeletions = fileChanges.deletions
    task.numberOfFilesChanged = fileChanges.filesChanged
    task.commitMessages = commits.map(commit => commit.message).join(' | ')

    // Counter devioation from normal flow on status edits
    const flow = ["Sprint Planning", "In Progress", "Delivered", "Accepted"]
    let lastFlowIndex = 0
    task.statusDeviateFromFlow = 0

    for (const { from, to } of statusEdits) {
      if (!["Backlog", "Archived"].includes(from) && !["Backlog", "Archived"].includes(to) && to !== from) {
        const fromIndex = flow.indexOf(from)
        const toIndex = flow.indexOf(to)
        if (fromIndex <= lastFlowIndex && toIndex < fromIndex) task.statusDeviateFromFlow += 1
        lastFlowIndex = Math.max(lastFlowIndex, toIndex)
      }
    }

    // Remove unnecessary keys
    delete task.statusEdits
    delete task.pointsEstimatedEdits
    delete task.points
    delete task.pointsBurnedEdits
    delete task.commits
  }

  return tasks
}

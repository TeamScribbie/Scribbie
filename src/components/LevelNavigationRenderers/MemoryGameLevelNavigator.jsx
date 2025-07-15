import React from 'react';

const MemoryGameLevelNavigator = ({ lesson, activityNodes, onSelectNode, onPrevLesson, onNextLesson }) => {
  // Fullscreen UI for Memory Game style navigation
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#111',
      color: '#fff',
      zIndex: 1000,
      padding: 32,
      textAlign: 'center',
      overflow: 'auto',
    }}>
      <h2>{lesson.lessonTitle} (Memory Game)</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        {activityNodes.map((node, idx) => (
          <button key={node.activityId} onClick={() => onSelectNode(node)} style={{ margin: 8 }}>
            Level {idx + 1}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={onPrevLesson} style={{ marginRight: 16 }}>{'\u2190 Prev Lesson'}</button>
        <button onClick={onNextLesson}>{'Next Lesson \u2192'}</button>
      </div>
    </div>
  );
};

export default MemoryGameLevelNavigator;

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ category, index, onDelete, isLoading, isDragging: globalIsDragging }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="col-12"
        >
            <div
                className={`d-flex justify-content-between align-items-center p-3 rounded ${isDragging
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-light'
                    }`}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transform: isDragging ? 'rotate(2deg)' : 'none',
                    opacity: isDragging ? 0.8 : 1,
                }}
            >
                <div className="d-flex align-items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className={isDragging ? 'text-white' : 'text-muted'}
                        style={{ cursor: isLoading ? 'not-allowed' : 'grab' }}
                    >
                        <i className="bi bi-grip-vertical fs-5"></i>
                    </div>
                    <span className="fw-semibold">{category.name}</span>
                    <span className={`badge ${isDragging ? 'bg-light text-primary' : 'bg-secondary'}`}>
                        {index + 1}
                    </span>
                </div>
                <button
                    onClick={() => onDelete(category._id, category.name)}
                    className={`btn btn-sm ${isDragging ? 'btn-outline-light' : 'btn-outline-danger'}`}
                    disabled={isLoading || globalIsDragging}
                    style={{ opacity: isDragging ? 0.7 : 1 }}
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>
    );
};

const DraggableCategories = ({
    categories,
    onReorder,
    onDelete,
    isLoading
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event) => {
        setIsDragging(false);
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = categories.findIndex(item => item._id === active.id);
            const newIndex = categories.findIndex(item => item._id === over.id);

            onReorder(oldIndex, newIndex);
        }
    };

    const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={sortedCategories.map(cat => cat._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="row g-2">
                    {sortedCategories.map((category, index) => (
                        <SortableItem
                            key={category._id}
                            category={category}
                            index={index}
                            onDelete={onDelete}
                            isLoading={isLoading}
                            isDragging={isDragging}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default DraggableCategories; 
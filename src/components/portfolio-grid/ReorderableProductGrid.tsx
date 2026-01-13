'use client';

import React, { useState, useEffect } from 'react';
import { Portfolio } from '@/interfaces';
import { PortfolioGridItem } from './PortfolioGridItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import styles from '@/styles/portfolioButton.module.css';
import { roboto } from "@/config/fonts";

interface Props {
  dataPortfolio: Portfolio[];
  selectedCategory: string;
}

interface SortableItemProps {
  id: number;
  portfolio: Portfolio;
}

const SortableItem = ({ id, portfolio }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.3 }}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <PortfolioGridItem portfolioData={portfolio} />
      </motion.div>
    </div>
  );
};

export const ReorderableProductGrid = ({ dataPortfolio, selectedCategory }: Props) => {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved order from server
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch('/api/portfolio/order');
        const result = await response.json();
        
        if (result.order && Array.isArray(result.order)) {
          const order: number[] = result.order;
          const orderedItems = order
            .map((id) => dataPortfolio.find((item) => item.id === id))
            .filter((item): item is Portfolio => item !== undefined);
          
          const existingIds = new Set(order);
          const newItems = dataPortfolio.filter((item) => !existingIds.has(item.id));
          
          setItems([...orderedItems, ...newItems]);
        } else {
          // Fallback to localStorage if server doesn't have order
          const savedOrder = localStorage.getItem('portfolio-order');
          if (savedOrder) {
            try {
              const order: number[] = JSON.parse(savedOrder);
              const orderedItems = order
                .map((id) => dataPortfolio.find((item) => item.id === id))
                .filter((item): item is Portfolio => item !== undefined);
              
              const existingIds = new Set(order);
              const newItems = dataPortfolio.filter((item) => !existingIds.has(item.id));
              
              setItems([...orderedItems, ...newItems]);
            } catch (e) {
              setItems(dataPortfolio);
            }
          } else {
            setItems(dataPortfolio);
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio order:', error);
        setItems(dataPortfolio);
      }
    };

    fetchOrder();
  }, [dataPortfolio]);

  useEffect(() => {
    const newCount = selectedCategory === 'all' ? 9 : items.length;
    setVisibleCount(newCount);
  }, [selectedCategory, items.length]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save order to server
        const order = newItems.map((item) => item.id);
        fetch('/api/portfolio/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order }),
        }).catch(console.error);
        
        // Also save to localStorage as backup
        localStorage.setItem('portfolio-order', JSON.stringify(order));
        
        return newItems;
      });
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className="flex flex-col items-center">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleItems.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {visibleItems.map((portfolio) => (
              <SortableItem
                key={portfolio.id}
                id={portfolio.id}
                portfolio={portfolio}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedCategory === 'all' && visibleCount < items.length && (
        <div>
          <div
            className="group m-3 w-[70px] h-[70px] rounded-full overflow-hidden outline-none hover:rotate-90 duration-300 cursor-pointer"
            onClick={handleShowMore}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="70px"
              height="70px"
              viewBox="0 0 24 24"
              className="stroke-pinkCustom fill-none group-hover:fill-rose-950 group-active:stroke-rose-950 group-active:fill-slate-700 group-active:duration-0 duration-300"
            >
              <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" strokeWidth="1.5"></path>
              <path d="M8 12H16" strokeWidth="1.5"></path>
              <path d="M12 16V8" strokeWidth="1.5"></path>
            </svg>
          </div>
          <p className={`${roboto.className} ${styles.showMore}`}>Show More</p>
        </div>
      )}
    </div>
  );
};

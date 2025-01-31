'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PersonCard from '@/components/PersonCard';

interface Category {
  name: string;
}

interface Participant {
  id: string;
  name: string;
  image: string;
  category_id: string;
  votes_count: number;
  is_active: boolean;
}

interface GroupedParticipants {
  [key: string]: {
    name: string;
    participants: Participant[];
  };
}

// Arabic translations for categories
const categoryTranslations: { [key: string]: string } = {
  'creators': 'المبدعون - Creators',
  'sports': 'الرياضيون - Sports',
  'organizations': 'المنظمات - Organizations'
};

// Sort categories to ensure consistent order
const categoryOrder = ['creators', 'sports', 'organizations'];

// Create a separate component for the participant card
const ParticipantCard = ({ participant, index, categoryIndex }: { 
  participant: Participant; 
  index: number; 
  categoryIndex: number;
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <PersonCard
      id={participant.id}
      name={participant.name}
      title={categoryTranslations[participant.category_id] || participant.category_id}
      imageUrl={participant.image}
      votes={participant.votes_count}
    />
  ) : null;
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
          <div className="aspect-square bg-gray-700/30 rounded-lg mb-4" />
          <div className="h-4 bg-gray-700/30 rounded w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

// Category header with modern styling
const CategoryHeader = ({ name }: { name: string }) => (
  <div className="relative py-6">
    <h2 className="text-3xl font-bold text-center font-arabic bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">
      {name}
    </h2>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-1 rounded-full bg-gradient-to-r from-primary/50 to-primary-light/50" />
  </div>
);

export default function ParticipantGrid() {
  const [groupedParticipants, setGroupedParticipants] = useState<GroupedParticipants>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    async function loadParticipants() {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select(`
            id,
            name,
            image,
            category_id,
            votes_count,
            is_active
          `)
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          setError('لم يتم العثور على مشاركين');
          return;
        }

        const grouped = data.reduce((acc: GroupedParticipants, participant) => {
          const categoryId = participant.category_id;
          const categoryName = categoryTranslations[categoryId] || categoryId;
          
          if (!acc[categoryId]) {
            acc[categoryId] = {
              name: categoryName,
              participants: []
            };
          }
          
          acc[categoryId].participants.push(participant);
          return acc;
        }, {});

        setGroupedParticipants(grouped);
        setError(null);
      } catch (err) {
        console.error('Error loading participants:', err);
        setError('فشل في تحميل المشاركين');
      } finally {
        setLoading(false);
      }
    }

    loadParticipants();
  }, []);

  if (!isClient || loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-center font-arabic">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const sortedCategories = Object.entries(groupedParticipants)
    .sort(([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

  return (
    <div className="container mx-auto px-4">
      <div className="space-y-24">
        {sortedCategories.map(([categoryId, category], categoryIndex) => (
          <div key={categoryId} className="space-y-12">
            <CategoryHeader name={category.name} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {category.participants.map((participant, index) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  index={index}
                  categoryIndex={categoryIndex}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
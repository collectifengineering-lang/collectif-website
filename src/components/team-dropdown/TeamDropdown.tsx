import { Team } from '@/interfaces'
import React from 'react'
import { TeamDropdownItem } from './TeamDropdownItem'


interface Props {
    dataTeam: Team[]
}

const TeamDropdown = ({dataTeam}: Props) => {
  const numberOfMembers = dataTeam.length
  const bgPosition: { [key: number]: string } = {}
  dataTeam.forEach((member, index) => {
    const percentagePosition = (100 / numberOfMembers) * index;
    bgPosition[member.id] = `0 ${percentagePosition}%`;
  });

  return (
    <div >
         {
            dataTeam.map((data) => (
                <TeamDropdownItem 
                    key={data.id} 
                    dataTeam={data}
                    bgPosition={bgPosition[data.id]}/>
            ))
        }
    </div>
  )
}

export default TeamDropdown
import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Announcement as AnnouncementIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SideMenu = ({ onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: '사용자 관리', icon: <PeopleIcon />, path: '/users' },
    { text: '업체 관리', icon: <BusinessIcon />, path: '/companies' },
    { text: '공지사항 관리', icon: <AnnouncementIcon />, path: '/notices' },
    { text: '문의사항 관리', icon: <QuestionAnswerIcon />, path: '/inquiries' }
  ];

  const handleClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton onClick={() => handleClick(item.path)}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SideMenu; 
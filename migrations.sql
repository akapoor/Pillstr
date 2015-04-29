CREATE TABLE `prescriptions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `userId` int(11) NOT NULL,
  `displayName` varchar(250),
  `quantity` double,
  `notes` text,
  `dosage` double NOT NULL,
  `remind` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `reminders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `prescriptionId` int(11) NOT NULL,
  `taken` tinyint(1) NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `username` varchar(250) NOT NULL UNIQUE,
  `email` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL,
  `phone` varchar(250),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `events` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `prescriptionId` int(11) NOT NULL,
  `day` INT(11) NOT NULL,
  `hour` INT(11) NOT NULL,
  `minute` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;